// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "../interfaces/IStableOracle.sol";

contract StableOracleDAI is IStableOracle {
    AggregatorV3Interface public immutable priceFeedDAI;

    constructor() {
        priceFeedDAI = AggregatorV3Interface(
            0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB
        );
    }

    function getPriceUSD() external view override returns (uint256) {
        (, int256 price, , uint256 updatedAt, ) = priceFeedDAI.latestRoundData();
        // if price is not updated for 24h, stall lock
        // after 30 days passes without updates then function as 'emergency' mode
        // with last known price regardless
        require(updatedAt > block.timestamp - 86400 || updatedAt < block.timestamp - (86400 * 30), "stall");

        return uint256(price) * 1e10;
    }
}
