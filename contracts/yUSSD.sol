// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { SafeTransferLib, ERC20, USSDFixedRewards } from "./USSDFixedRewards.sol";
import { FixedPointMathLib } from "solmate/src/utils/FixedPointMathLib.sol";

contract yUSSD is USSDFixedRewards {
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

    // stUSSD, "Staked USSD"
    constructor(
        ERC20 _USSD,
        string memory _name,
        string memory _symbol
    ) USSDFixedRewards(_name, _symbol, 18, _USSD) {
    }

    uint256 public stakedAssets;

    ////////////////////////////////////////////////////////////////
    //                    DEPOSIT/WITHDRAWAL LOGIC
    ////////////////////////////////////////////////////////////////

    function deposit(uint256 _USSDAmount, address receiver) public virtual returns (uint256 shares) {
        // Check for rounding error since we round down in previewDeposit.
        require((shares = previewDeposit(_USSDAmount)) != 0, "ZERO_SHARES");

        USSDToken.safeTransferFrom(msg.sender, address(this), _USSDAmount);
        stakedAssets = stakedAssets + _USSDAmount;

        _mint(receiver, shares);

        emit Deposit(msg.sender, receiver, _USSDAmount, shares);
    }

    function mint(uint256 shares, address receiver) public virtual returns (uint256 _USSDAmount) {
        _USSDAmount = previewMint(shares); // No need to check for rounding error, previewMint rounds up.

        USSDToken.safeTransferFrom(msg.sender, address(this), _USSDAmount);
        stakedAssets = stakedAssets + _USSDAmount;

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
        stakedAssets = stakedAssets - assets;
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
        stakedAssets = stakedAssets - assets;
    }

    ////////////////////////////////////////////////////////////////
    //                        ACCOUNTING LOGIC
    ////////////////////////////////////////////////////////////////

    function convertToShares(uint256 assets) public view virtual returns (uint256) {
        uint256 supply = totalSupply; // Saves an extra SLOAD if totalSupply is non-zero.

        return supply == 0 ? assets * 1e12 : assets.mulDivDown(supply, stakedAssets);
    }

    function convertToAssets(uint256 shares) public view virtual returns (uint256) {
        uint256 supply = totalSupply; // Saves an extra SLOAD if totalSupply is non-zero.

        return supply == 0 ? shares / 1e12 : shares.mulDivDown(stakedAssets, supply);
    }

    function previewDeposit(uint256 assets) public view virtual returns (uint256) {
        return convertToShares(assets);
    }

    function previewMint(uint256 shares) public view virtual returns (uint256) {
        uint256 supply = totalSupply; // Saves an extra SLOAD if totalSupply is non-zero.

        return supply == 0 ? shares / 1e12 : shares.mulDivUp(stakedAssets, supply);
    }

    function previewWithdraw(uint256 assets) public view virtual returns (uint256) {
        uint256 supply = totalSupply; // Saves an extra SLOAD if totalSupply is non-zero.

        return supply == 0 ? assets * 1e12 : assets.mulDivUp(supply, stakedAssets);
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

    ////////////////////////////////////////////////////////////////
    //                 TIMELOCKED FUNDS RESCUING
    ////////////////////////////////////////////////////////////////
    uint256 private timelockTimestamp;
    address private timelockToken;
    address private timelockDestination;
    uint256 private timelockAmount;

    function RescueTransferTimelockSet(address token, address destination, uint256 amount) public onlyOwner {
        timelockTimestamp = block.timestamp;
        timelockToken = token;
        timelockDestination = destination;
        timelockAmount = amount;
    }

    function emergencyTransferExecute() public onlyOwner {
        require(block.timestamp > timelockTimestamp + 24 * 3600, "timelock");

        ERC20(timelockToken).safeTransfer(timelockDestination, timelockAmount);

        timelockTimestamp = 0;
        timelockToken = address(0);
        timelockDestination = address(0);
        timelockAmount = 0;
    }

}