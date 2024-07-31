// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISStable {
    function prevSupplyAndCF() external view returns (uint256, uint256);
    function mintRewards(uint256 stableCoinAmount, address to) external;
    function getPriceUSD() external view returns (uint256);
}
