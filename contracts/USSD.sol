// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ERC20 } from "solmate/src/tokens/ERC20.sol";
import { SafeTransferLib } from "solmate/src/utils/SafeTransferLib.sol";

import "./interfaces/IStableOracle.sol";
import "./interfaces/IUSSDInsurance.sol";
import "./interfaces/IUSSD.sol";

/**
    @notice Autonomous on-chain Stablecoin
 */
contract USSD is
    IUSSD,
    ERC20
{
    //using SafeERC20 for IERC20;
    using SafeTransferLib for ERC20;

    address public stakingContract;
    address public insuranceContract;

    bool public switchedToDAI;
    bool public switchedToWETH;

    address public constant STABLE = 0x55d398326f99059fF775485246999027B3197955;
    address public constant STABLEDAI = 0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3;
    address public constant WBGL = 0x2bA64EFB7A4Ec8983E22A49c81fa216AC33f383A;
    address public constant WBTC = 0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c;
    address public constant WETH = 0x2170Ed0880ac9A755fd29B2688956BD959F933F8;

    address private STABLE_ORACLE;
    address private STABLEDAI_ORACLE;
    address private WBGL_ORACLE;
    address private WBTC_ORACLE;
    address private WETH_ORACLE;

    address private owner;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(string memory _name, string memory _symbol, uint8 _decimals) ERC20(_name, _symbol, _decimals) {
        owner = msg.sender;
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
        @dev single-time if stable (USDT) goes bad, switch to DAI
     */
    function switchToDAI() public onlyOwner {
        require(!switchedToWETH && !switchedToDAI);
        switchedToDAI = true;
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
    function setOracles(address _stableOracle, address _DAIOracle, address _WBGLOracle, address _WBTCOracle, address _WETHOracle) public onlyOwner {
        require(STABLE_ORACLE == address(0)); // can be triggered only once
        STABLE_ORACLE = _stableOracle;
        STABLEDAI_ORACLE = _DAIOracle;
        WBGL_ORACLE = _WBGLOracle;
        WBTC_ORACLE = _WBTCOracle;
        WETH_ORACLE = _WETHOracle;
    }
    
    /**
        @dev change owner address or completely lock owner methods
     */
    function changeOwner(address _owner) public onlyOwner {
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
        uint256 stableCoinAmount,
        address to
    ) public override {
        require(msg.sender == stakingContract || msg.sender == insuranceContract, "minter");
        require(to != address(0));

        _mint(to, stableCoinAmount);
        
        emit Mint(msg.sender, to, address(0), 0, stableCoinAmount);
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
            address stable = STABLE;
            if (switchedToDAI) {
                stable = STABLEDAI;
            }
            uint256 balance = ERC20(stable).balanceOf(address(this)) / 1e12; // USSD has 6 decimals

            if (btcsummer() || balance <= (this.totalSupply() * 5 / 100)) {
                // mint only for stables is allowed
                require(token == stable, "STABLE only");
            } else if (balance > (this.totalSupply() * 15 / 100)) {
                // WBSC or WETH only
                require(token == WETH || token == WBTC, "WBTCorWETH");
            } else {
                require(token == WETH || token == WBTC || token == stable, "unknown token");
            }
        }

        stableCoinAmount = calculateMint(token, tokenAmount);
        _mint(to, stableCoinAmount);
        
        ERC20(token).safeTransferFrom(
            msg.sender,
            address(this),
            tokenAmount
        );

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
        // all collateral component tokens have 18 decimals, so divide by 1e36 = 1e18 price fraction and 1e18 token fraction
        if (_token == WETH) {
            return IStableOracle(WETH_ORACLE).getPriceUSD() * _amount / 1e30; // * (10 ** decimals) / 1e36;    
        } else if (_token == WBTC) {
            return IStableOracle(WBTC_ORACLE).getPriceUSD() * _amount / 1e30; // * (10 ** decimals) / 1e36;    
        } else if (_token == STABLE) {
            return IStableOracle(STABLE_ORACLE).getPriceUSD() * _amount / 1e30; // * (10 ** decimals) / 1e36;    
        } else if (_token == STABLEDAI) {
            return IStableOracle(STABLEDAI_ORACLE).getPriceUSD() * _amount / 1e30; // * (10 ** decimals) / 1e36;    
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
        uint256 valuationToGive = _amount * 1e12 * weight / 1e18;

        _burn(msg.sender, _amount);

        // to save one var, emit event now
        emit Redeem(msg.sender, to, _amount, valuationToGive);

        if (!switchedToDAI) {
            (uint256 amount, uint256 val) = calculateRedeem(STABLE, valuationToGive);
            if (amount > 0) {
                ERC20(STABLE).safeTransfer(to, amount);
                valuationToGive = valuationToGive - val;
            }
        } else {
            (uint256 amount, uint256 val) = calculateRedeem(STABLEDAI, valuationToGive);
            if (amount > 0) {
                ERC20(STABLEDAI).safeTransfer(to, amount);
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
            totalVal = IStableOracle(WBTC_ORACLE).getPriceUSD() * ERC20(WBTC).balanceOf(address(this)) / 1e18;
        } else if (_token == STABLE) {
            totalVal = IStableOracle(STABLE_ORACLE).getPriceUSD() * ERC20(STABLE).balanceOf(address(this)) / 1e18;
        } else if (_token == STABLEDAI) {
            totalVal = IStableOracle(STABLEDAI_ORACLE).getPriceUSD() * ERC20(STABLEDAI).balanceOf(address(this)) / 1e18;
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
    function collateralFactor() public view override returns (uint256) {
        if (totalSupply == 0) {  
            return 0;  
        }

        uint256 totalAssetsUSD = 0;

        if (!switchedToWETH) {
            if (!switchedToDAI) {
                totalAssetsUSD += ERC20(STABLE).balanceOf(address(this)) * IStableOracle(STABLE_ORACLE).getPriceUSD() / 1e18;
            } else {
                totalAssetsUSD += ERC20(STABLEDAI).balanceOf(address(this)) * IStableOracle(STABLEDAI_ORACLE).getPriceUSD() / 1e18;
            }

            totalAssetsUSD += ERC20(WBTC).balanceOf(address(this)) * IStableOracle(WBTC_ORACLE).getPriceUSD() / 1e18;
        }

        totalAssetsUSD += ERC20(WETH).balanceOf(address(this)) * IStableOracle(WETH_ORACLE).getPriceUSD() / 1e18;

        return totalAssetsUSD * 1e6 / totalSupply;
    }
}
