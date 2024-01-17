// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IUSSD {
    function collateralFactor() external view returns(uint256);
}
