// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "../interfaces/IStableOracle.sol";

contract StableOracleUSDT is IStableOracle {
    AggregatorV3Interface public immutable priceFeedUSDTUSD;

    constructor() {
        priceFeedUSDTUSD = AggregatorV3Interface(
            0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7
        );
    }

    function getPriceUSD() external view override returns (uint256) {
        (, int256 price, , uint256 updatedAt, ) = priceFeedUSDTUSD.latestRoundData();
        require(updatedAt > block.timestamp - 86400, "stall");

        return uint256(price) * 1e10;
    }
}
