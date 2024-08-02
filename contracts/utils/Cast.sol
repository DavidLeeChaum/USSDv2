// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Cast {
    function u128(uint256 x) internal pure returns (uint128 y) {
        require(x <= type(uint128).max, "Cast overflow");
        y = uint128(x);
    }

    function u96(uint256 x) internal pure returns (uint96 y) {
        require(x <= type(uint96).max, "Cast overflow");
        y = uint96(x);
    }

    function u32(uint256 x) internal pure returns (uint32 y) {
        require(x <= type(uint32).max, "Cast overflow");
        y = uint32(x);
    }
}
