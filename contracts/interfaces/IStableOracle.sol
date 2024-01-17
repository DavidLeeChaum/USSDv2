// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IStableOracle {
    // return 18 decimals USD price of an asset
    function getPriceUSD() external view returns (uint256);
}
