// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "../interfaces/IStableOracle.sol";

contract StableOracleWBTC is IStableOracle {
    AggregatorV3Interface public immutable priceFeed;

    constructor() {
        priceFeed = AggregatorV3Interface(
            0xd0C7101eACbB49F3deCcCc166d238410D6D46d57
        );
    }

    function getPriceUSD() external view override returns (uint256) {
        //(uint80 roundID, int256 price, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound) = priceFeed.latestRoundData();
        (, int256 price, , uint256 updatedAt, ) = priceFeed.latestRoundData();
        // if price is not updated for 24h, stall lock
        // after 30 days passes without updates then function as 'emergency' mode
        // with last known price regardless
        require(updatedAt > block.timestamp - 86400 || updatedAt < block.timestamp - (86400 * 30), "stall");

        // chainlink price data is 8 decimals for WETH/USD
        return uint256(price) * 1e10;
    }
}
