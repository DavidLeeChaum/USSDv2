// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { SafeTransferLib, ERC20, USSDRewards } from "./USSDRewards.sol";
import { FixedPointMathLib } from "solmate/src/utils/FixedPointMathLib.sol";

import "./interfaces/IUSSDInsurance.sol";

contract ICT is USSDRewards, IUSSDInsurance {
    using SafeTransferLib for ERC20;
    using FixedPointMathLib for uint256;

    uint256 public constant SDT_RATE = 42000000000000000; // 4.2% APY

    address public constant WETH = 0x2170Ed0880ac9A755fd29B2688956BD959F933F8;
    address public constant WBGL = 0x2bA64EFB7A4Ec8983E22A49c81fa216AC33f383A;

    address private owner;

    uint256 public startingTs;
    
    bool public switchedToWETH;

    event Deposit(
        address indexed from,
        address indexed to,
        address token,
        uint256 amountToken,
        uint256 amountShares
    );

    event InsuranceClaim(
        address indexed token,
        uint256 amountToken
    );

    // ICT, "Insurance Capital Treasury"
    constructor(
        ERC20 _USSD,
        string memory _name,
        string memory _symbol
    ) USSDRewards(_name, _symbol, 18, _USSD, SDT_RATE) {
        startingTs = block.timestamp;
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
        @dev change owner address or completely lock owner methods
     */
    function changeOwner(address _owner) public onlyOwner {
        owner = _owner;
    }

    function switchToWETH() public onlyOwner {
        require(!switchedToWETH);
        switchedToWETH = true;
    }

    ////////////////////////////////////////////////////////////////
    //                    MINT LOGIC
    ////////////////////////////////////////////////////////////////

    function mintWBGL(uint256 _amountWBGL, address receiver) public virtual returns (uint256 mintAmount) {
        require(!switchedToWETH, "WETH only");
        require(ERC20(WBGL).balanceOf(address(this)) + _amountWBGL < 5000000 * 1e18, "quota reached");

        // price is from 1 to 10 WBGL for insurance token
        mintAmount = _amountWBGL / SDTforWBGL();

        // Need to transfer before minting or ERC777s could reenter.
        ERC20(WBGL).safeTransferFrom(msg.sender, address(this), _amountWBGL);

        _mint(receiver, mintAmount);

        emit Deposit(msg.sender, receiver, WBGL, _amountWBGL, mintAmount);
    }

    function mintWETH(uint256 _amountWETH, address receiver) public virtual returns (uint256 mintAmount) {
        require(switchedToWETH || ERC20(WBGL).balanceOf(address(this)) >= 5000000 * 1e18, "WBGL only");

        // price is fixed to 0.1Eth per insurance token
        mintAmount = _amountWETH / 10;

        // Need to transfer before minting or ERC777s could reenter.
        ERC20(WETH).safeTransferFrom(msg.sender, address(this), _amountWETH);

        _mint(receiver, mintAmount);

        emit Deposit(msg.sender, receiver, WETH, _amountWETH, mintAmount);
    }

    ////////////////////////////////////////////////////////////////
    //                    INSURANCE LOGIC
    ////////////////////////////////////////////////////////////////

    // insurance claim is actualized only once per 24 hour cooldown period, triggered by USSD only (before performing redeem)
    uint256 public lastClaimed = 0;

    function insuranceClaim() external override {
        require(msg.sender == address(USSDToken), "USSD only");

        // transfer 1% of current balances to USSD contract if above certain fixed thresholds (to avoid dust transfers)
        if ((block.timestamp - 24 * 3600) >= lastClaimed) {
            uint256 wethBalance = ERC20(WETH).balanceOf(address(this));
            if (wethBalance > 1e18) { // from 1 WETH
                ERC20(WETH).safeTransfer(address(USSDToken), wethBalance / 100);
                emit InsuranceClaim(WETH, wethBalance / 100);
            }

            uint256 wbglBalance = ERC20(WBGL).balanceOf(address(this));
            if (wbglBalance > 1e21) { // from 1000 WBGL
                ERC20(WBGL).safeTransfer(address(USSDToken), wbglBalance / 100);
                emit InsuranceClaim(WBGL, wbglBalance / 100);
            }

            lastClaimed = block.timestamp;
        }
    }

    ////////////////////////////////////////////////////////////////
    //                        ACCOUNTING LOGIC
    ////////////////////////////////////////////////////////////////

    function SDTforWBGL() public view returns(uint256 wbglforsdt) {
        // 3 * 30 * 24 * 3600 = 7776000 seconds in 90 days
        wbglforsdt = 1 + (block.timestamp - startingTs) / 7776000;
        if (wbglforsdt > 10) {
            wbglforsdt = 10;
        }
    }
}