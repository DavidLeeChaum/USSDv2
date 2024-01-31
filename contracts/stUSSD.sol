// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { SafeTransferLib, ERC20, USSDRewards } from "./USSDRewards.sol";
import { FixedPointMathLib } from "solmate/src/utils/FixedPointMathLib.sol";

contract stUSSD is USSDRewards {
    using SafeTransferLib for ERC20;
    using FixedPointMathLib for uint256;

    ////////////////////////////////////////////////////////////////
    //                             EVENTS
    ////////////////////////////////////////////////////////////////

    event Deposit(
        address indexed caller, 
        address indexed owner, 
        uint256 assets, 
        uint256 shares);

    event Withdraw(
        address indexed caller,
        address indexed receiver,
        address indexed owner,
        uint256 assets,
        uint256 shares
    );

    ////////////////////////////////////////////////////////////////
    //                           IMMUTABLES
    ////////////////////////////////////////////////////////////////

    uint256 public constant STUSSD_RATE = 18000000000000000; // 1.8% APY

    // stUSSD, "Staked USSD"
    constructor(
        ERC20 _USSD,
        string memory _name,
        string memory _symbol
    ) USSDRewards(_name, _symbol, 18, _USSD, STUSSD_RATE) {
    }

    ////////////////////////////////////////////////////////////////
    //                    DEPOSIT/WITHDRAWAL LOGIC
    ////////////////////////////////////////////////////////////////

    function deposit(uint256 _USSDAmount, address receiver) public virtual returns (uint256 shares) {
        // Check for rounding error since we round down in previewDeposit.
        require((shares = previewDeposit(_USSDAmount)) != 0, "ZERO_SHARES");

        USSDToken.safeTransferFrom(msg.sender, address(this), _USSDAmount);

        _mint(receiver, shares);

        emit Deposit(msg.sender, receiver, _USSDAmount, shares);
    }

    function mint(uint256 shares, address receiver) public virtual returns (uint256 _USSDAmount) {
        _USSDAmount = previewMint(shares); // No need to check for rounding error, previewMint rounds up.

        USSDToken.safeTransferFrom(msg.sender, address(this), _USSDAmount);

        _mint(receiver, shares);

        emit Deposit(msg.sender, receiver, _USSDAmount, shares);
    }

    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    ) public virtual returns (uint256 shares) {
        shares = previewWithdraw(assets); // No need to check for rounding error, previewWithdraw rounds up.

        if (msg.sender != owner) {
            uint256 allowed = allowance[owner][msg.sender]; // Saves gas for limited approvals.

            if (allowed != type(uint256).max) allowance[owner][msg.sender] = allowed - shares;
        }

        _burn(owner, shares);

        if (balanceOf[owner] == 0) _claim(owner, receiver, currentUserRewards(owner));

        emit Withdraw(msg.sender, receiver, owner, assets, shares);

        USSDToken.safeTransfer(receiver, assets);
    }

    function redeem(
        uint256 shares,
        address receiver,
        address owner
    ) public virtual returns (uint256 assets) {
        if (msg.sender != owner) {
            uint256 allowed = allowance[owner][msg.sender]; // Saves gas for limited approvals.

            if (allowed != type(uint256).max) allowance[owner][msg.sender] = allowed - shares;
        }

        // Check for rounding error since we round down in previewRedeem.
        require((assets = previewRedeem(shares)) != 0, "ZERO_ASSETS");

        _burn(owner, shares);

        if (balanceOf[owner] == 0) _claim(owner, receiver, currentUserRewards(owner));

        emit Withdraw(msg.sender, receiver, owner, assets, shares);

        USSDToken.safeTransfer(receiver, assets);
    }

    ////////////////////////////////////////////////////////////////
    //                        ACCOUNTING LOGIC
    ////////////////////////////////////////////////////////////////

    function totalAssets() public view returns (uint256) {
        // staked token is 1e18 decimals (USSD is 1e6 stablecoin), so multiply to match for prettier balance numbers
        return USSDToken.balanceOf(address(this));
    }

    function convertToShares(uint256 assets) public view virtual returns (uint256) {
        uint256 supply = totalSupply; // Saves an extra SLOAD if totalSupply is non-zero.

        return supply == 0 ? assets * 1e12 : assets.mulDivDown(supply, totalAssets());
    }

    function convertToAssets(uint256 shares) public view virtual returns (uint256) {
        uint256 supply = totalSupply; // Saves an extra SLOAD if totalSupply is non-zero.

        return supply == 0 ? shares / 1e12 : shares.mulDivDown(totalAssets(), supply);
    }

    function previewDeposit(uint256 assets) public view virtual returns (uint256) {
        return convertToShares(assets);
    }

    function previewMint(uint256 shares) public view virtual returns (uint256) {
        uint256 supply = totalSupply; // Saves an extra SLOAD if totalSupply is non-zero.

        return supply == 0 ? shares / 1e12 : shares.mulDivUp(totalAssets(), supply);
    }

    function previewWithdraw(uint256 assets) public view virtual returns (uint256) {
        uint256 supply = totalSupply; // Saves an extra SLOAD if totalSupply is non-zero.

        return supply == 0 ? assets * 1e12 : assets.mulDivUp(supply, totalAssets());
    }

    function previewRedeem(uint256 shares) public view virtual returns (uint256) {
        return convertToAssets(shares);
    }

    ////////////////////////////////////////////////////////////////
    //                 DEPOSIT/WITHDRAWAL LIMIT LOGIC
    ////////////////////////////////////////////////////////////////

    function maxWithdraw(address owner) public view virtual returns (uint256) {
        return convertToAssets(balanceOf[owner]);
    }

    function maxRedeem(address owner) public view virtual returns (uint256) {
        return balanceOf[owner];
    }
}