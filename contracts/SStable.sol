// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ERC20 } from "solmate/src/tokens/ERC20.sol";
import { SafeTransferLib } from "solmate/src/utils/SafeTransferLib.sol";

import "./interfaces/IStableOracle.sol";
import "./interfaces/IUSSDInsurance.sol";
import "./interfaces/ISStable.sol";
import "./interfaces/IUSSD.sol";

/**
    @notice Autonomous on-chain Stablecoin
 */
contract SStable is
    ISStable,
    ERC20
{
    //using SafeERC20 for IERC20;
    using SafeTransferLib for ERC20;

    address public stakingContract;
    address public insuranceContract;

    address public yieldAddress;

    bool public switchedToWETH;

    address public constant USSD = 0x33C88D4caC6aC34F77020915a2a88cd0417dC069; // USSD Arbitrum
    address public constant WBGL = 0x2bA64EFB7A4Ec8983E22A49c81fa216AC33f383A;
    address public constant WBTC = 0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f;
    address public constant WETH = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;

    // founder fee (1%)
    uint256 private constant FOUNDER_FEE = 10_000_000_000_000_000;

    address private ASSET_ORACLE;

    address private USSD_ORACLE;
    address private WBGL_ORACLE;
    address private WBTC_ORACLE;
    address private WETH_ORACLE;

    address private owner;

    uint256 private currSupply;
    uint256 private prevSupply;
    uint256 private currCollateralFactor;
    uint256 private prevCollateralFactor;
    uint256 private prevBlockNo;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(string memory _name, string memory _symbol, uint8 _decimals, address _yieldaddress) ERC20(_name, _symbol, _decimals) {
        owner = msg.sender;
        yieldAddress = _yieldaddress;
    }

    /**
        @dev restrict calls only by STABLE_CONTROL_ROLE role
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "owner");
        _;
    }

    /**
        @dev connect staking contract (deployed after this contract)
     */
    function connectStaking(address _staking) public onlyOwner {
        require(stakingContract == address(0)); // can be triggered only once
        stakingContract = _staking;
    }

    /**
        @dev connect insurance contract (deployed after this contract)
     */
    function connectInsurance(address _insurance) public onlyOwner {
        require(insuranceContract == address(0)); // can be triggered only once
        insuranceContract = _insurance;
    }

    /**
        @dev single-time if all collateral pegs fail, switch to WETH only
     */
    function switchToWETH() public onlyOwner {
        require(!switchedToWETH);
        switchedToWETH = true;
    }

    /**
        @dev single-time connect oracles (or these addresses could be hardcoded consts)
     */
    function setOracles(address _assetOracle, address _stableOracle, address _WBGLOracle, address _WBTCOracle, address _WETHOracle) public onlyOwner {
        require(USSD_ORACLE == address(0)); // can be triggered only once
        ASSET_ORACLE = _assetOracle;
        USSD_ORACLE = _stableOracle;
        WBGL_ORACLE = _WBGLOracle;
        WBTC_ORACLE = _WBTCOracle;
        WETH_ORACLE = _WETHOracle;
    }

    /**
        @dev change owner address or completely lock owner methods
     */
    function changeOwner(address _owner) public onlyOwner {
        require(owner != 0x0000000000000000000000000000000000000000, "zero addr");
        owner = _owner;
    }

    /*//////////////////////////////////////////////////////////////
                                Events
    //////////////////////////////////////////////////////////////*/

    event Mint(
        address indexed from,
        address indexed to,
        address token,
        uint256 amountToken,
        uint256 amountUSSD
    );

    event Redeem(
        address indexed from,
        address indexed to,
        uint256 amountUSSD,
        uint256 amountValuation
    );

    /*//////////////////////////////////////////////////////////////
                             MINT LOGIC
    //////////////////////////////////////////////////////////////*/

    /**
        @dev Mint by staking or insurance contracts as rewards
             could be called only by staking or insurance contracts
     */
    function mintRewards(
        uint256 USDAmount,
        address to
    ) public override {
        require(msg.sender == stakingContract || msg.sender == insuranceContract, "minter");
        require(to != address(0));

        uint256 mintAmount = USDAmount * 1e18 / IStableOracle(ASSET_ORACLE).getPriceUSD();

        uint256 founderFee = mintAmount * FOUNDER_FEE / 1e18;
        _mint(to, mintAmount - founderFee);
        if(yieldAddress == address(0)) {
            _mint(owner, founderFee);
        } else {
            _mint(owner, founderFee / 2);
            _mint(yieldAddress, founderFee / 2);
        }

        emit Mint(msg.sender, to, address(0), 0, mintAmount - founderFee);
    }

    /**
        @dev mint specific AMOUNT OF STABLE by giving token depending on conditions
    */
    function mintForToken(
        address token,
        uint256 tokenAmount,
        address to
    ) public returns (uint256 stableCoinAmount) {
        require(to != address(0));

        if (switchedToWETH) {
            require(token == WETH, "weth only");
        } else {
            uint256 balance = ERC20(USSD).balanceOf(address(this));

            if (btcsummer() || balance <= (this.totalSupply() * 5 / 100)) {
                // mint only for stables is allowed
                require(token == USSD, "USSD only");
            } else if (balance > (this.totalSupply() * 15 / 100)) {
                // WBSC or WETH only
                require(token == WETH || token == WBTC, "WBTCorWETH");
            } else {
                require(token == WETH || token == WBTC || token == USSD, "unknown token");
            }
        }

        stableCoinAmount = calculateMint(token, tokenAmount);
        _mint(to, stableCoinAmount);
        
        ERC20(token).safeTransferFrom(
            msg.sender,
            address(this),
            tokenAmount
        );

        // protect from flash-loan supply inflation
        if (block.number > prevBlockNo) {
            prevSupply = currSupply; // remember latest total supply in some prev. block
            prevCollateralFactor = currCollateralFactor;
            prevBlockNo = block.number;
        }
        currSupply = totalSupply;
        currCollateralFactor = collateralFactor();

        emit Mint(msg.sender, to, token, tokenAmount, stableCoinAmount);
    }

    /**
        @dev try to evaluate stage of BTC 4-year halving cycle
    */
    function btcsummer() internal view returns (bool) {
        // (822721 + (block.timestamp - 1703420845) / 600) % 210000
        // range 0-209999
        // 52500 - 105000 is 2nd stage of cycle (summer), otherwise 1st stage of cycle (winter)
        uint256 cycle = (822721 + (block.timestamp - 1703420845) / 600) % 210000;
        if (cycle >= 52500 && cycle <= 105000) {
            return true;
        }
        return false;
    }

    /**
        @dev Return how much STABLECOIN does user receive for AMOUNT of asset
    */
    function calculateMint(address _token, uint256 _amount) public view returns (uint256) {
        // for collateral component tokens that have 18 decimals, so divide by 1e36 = 1e18 price fraction and 1e18 token fraction
        if (_token == WETH) {
            return IStableOracle(WETH_ORACLE).getPriceUSD() * _amount / 1e12 / IStableOracle(ASSET_ORACLE).getPriceUSD(); // * (10 ** decimals) / 1e36;
        } else if (_token == WBTC) {
            return IStableOracle(WBTC_ORACLE).getPriceUSD() * _amount / 1e2 / IStableOracle(ASSET_ORACLE).getPriceUSD(); // * (10 ** decimals) / 1e26; WBTC 8 decimals
        } else if (_token == USSD) {
            return IStableOracle(USSD_ORACLE).getPriceUSD() * _amount / IStableOracle(ASSET_ORACLE).getPriceUSD(); // * (10 ** decimals) / 1e24; USDT 6 decimals
        }
        revert("unknown_token");
    }

    /**
        @dev Redeem specific AMOUNT OF COLLATERAL by burning token
    */
    function redeem(
        uint256 _amount,
        address to
    ) public {
        require(to != address(0));

        uint256 cf = collateralFactor();

        if (cf < 900000000000000000) {
            IUSSDInsurance(insuranceContract).insuranceClaim();
            // insurance claim can change collateral factor, so we recalculate it for this redeem
            cf = collateralFactor();
        }

        uint256 weight = 1e18;
        if (cf < 950000000000000000) {
            // penalize redeems when undercollateralized to avoid bank runs and redeem competition
            weight = cf * 950000000000000000 / 1e18;
        }

        // USD valuation (1e18 based)
        uint256 valuationToGive = _amount * 1e12 * weight * IStableOracle(ASSET_ORACLE).getPriceUSD() / 1e36;

        _burn(msg.sender, _amount);

        // to save one var, emit event now
        emit Redeem(msg.sender, to, _amount, valuationToGive);

        if (valuationToGive > 0) {
            (uint256 amount, uint256 val) = calculateRedeem(USSD, valuationToGive);
            if (amount > 0) {
                ERC20(USSD).safeTransfer(to, amount);
                valuationToGive = valuationToGive - val;
            }
        }

        if (valuationToGive > 0) {
            (uint256 amount, uint256 val) = calculateRedeem(WBGL, valuationToGive);
            if (amount > 0) {
                ERC20(WBGL).safeTransfer(to, amount);
                valuationToGive = valuationToGive - val;
            }
        }

        if (valuationToGive > 0) {
            (uint256 amount, uint256 val) = calculateRedeem(WBTC, valuationToGive);
            if (amount > 0) {
                ERC20(WBTC).safeTransfer(to, amount);
                valuationToGive = valuationToGive - val;
            }
        }

        if (valuationToGive > 0) {
            (uint256 amount, uint256 val) = calculateRedeem(WETH, valuationToGive);
            if (amount > 0) {
                ERC20(WETH).safeTransfer(to, amount);
                valuationToGive = valuationToGive - val;
            }
        }
    }

    /**
        @dev Return valuation to track if redeem is completely covered by this collateral component
    */
    function calculateRedeem(address _token, uint256 _valuation) public view returns (uint256 amount, uint256 valuation) {
        uint256 totalVal = 0;
        if (_token == WETH) {
            totalVal = IStableOracle(WETH_ORACLE).getPriceUSD() * ERC20(WETH).balanceOf(address(this)) / 1e18;
        } else if (_token == WBTC) {
            totalVal = IStableOracle(WBTC_ORACLE).getPriceUSD() * ERC20(WBTC).balanceOf(address(this)) / 1e8;
        } else if (_token == USSD) {
            totalVal = IStableOracle(USSD_ORACLE).getPriceUSD() * ERC20(USSD).balanceOf(address(this)) / 1e6;
        } else if (_token == WBGL) {
            totalVal = IStableOracle(WBGL_ORACLE).getPriceUSD() * ERC20(WBGL).balanceOf(address(this)) / 1e18;
        } else {
            revert("unknown_token");
        }

        if (_valuation <= totalVal) {
            // only partial redeem using this collateral component
            return (ERC20(_token).balanceOf(address(this)) * _valuation / totalVal, _valuation);
        } else {
            // enough to do full redeem
            return (ERC20(_token).balanceOf(address(this)), totalVal);
        }
    }

    /*//////////////////////////////////////////////////////////////
                         ACCOUNTING LOGIC
    //////////////////////////////////////////////////////////////*/

    /**
        @dev Estimate own collateral ratio based on collateral component prices
        @return 1e18-based collateral ratio (1e18 = 1.0, >1.0 overcollateralized, <1.0 undercollateralized)
    */
    function collateralFactor() public view returns (uint256) {
        if (totalSupply == 0) {  
            return 0;  
        }

        uint256 totalAssetsUSD = 0;

        if (!switchedToWETH) {
            totalAssetsUSD += ERC20(USSD).balanceOf(address(this)) * IStableOracle(USSD_ORACLE).getPriceUSD() / 1e6;
            totalAssetsUSD += ERC20(WBTC).balanceOf(address(this)) * IStableOracle(WBTC_ORACLE).getPriceUSD() / 1e8;
        }

        totalAssetsUSD += ERC20(WETH).balanceOf(address(this)) * IStableOracle(WETH_ORACLE).getPriceUSD() / 1e18;

        return totalAssetsUSD * 1e24 / totalSupply / IStableOracle(ASSET_ORACLE).getPriceUSD();
    }

    /**
        @dev returns collateral factor and total supply at the state after mint in some previous block
             (used for the flash-loan protection when distributing rewards)
    */
    function prevSupplyAndCF() override external view returns (uint256, uint256) {
        return (prevSupply, prevCollateralFactor);
    }

    function getPriceUSD() override external view returns (uint256) {
        return IStableOracle(ASSET_ORACLE).getPriceUSD();
    }
}
