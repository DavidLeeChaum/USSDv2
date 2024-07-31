// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "../interfaces/IStableOracle.sol";
import "../interfaces/IUSSD.sol";

contract StableOracleUSSD is IStableOracle {
    IUSSD public immutable USSD;

    constructor() {
        USSD = IUSSD(
            0x33C88D4caC6aC34F77020915a2a88cd0417dC069
        );
    }

    function getPriceUSD() external view override returns (uint256) {

        (, uint256 cf) = USSD.prevSupplyAndCF(); 
        if(cf >= 1000000000000000000) {
            return 1e18;
        }

        return cf;
    }
}
