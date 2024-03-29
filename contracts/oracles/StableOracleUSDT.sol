// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "../interfaces/IStableOracle.sol";

contract StableOracleUSDT is IStableOracle {
    AggregatorV3Interface public immutable priceFeedUSDTUSD;

    constructor() {
        priceFeedUSDTUSD = AggregatorV3Interface(
            0xB97Ad0E74fa7d920791E90258A6E2085088b4320
        );
    }

    function getPriceUSD() external view override returns (uint256) {
        (, int256 price, , uint256 updatedAt, ) = priceFeedUSDTUSD.latestRoundData();
        require(updatedAt > block.timestamp - 86400, "stall");

        return uint256(price) * 1e10;
    }
}
