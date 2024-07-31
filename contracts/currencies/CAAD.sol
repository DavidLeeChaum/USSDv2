// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ERC20 } from "solmate/src/tokens/ERC20.sol";
import { SafeTransferLib } from "solmate/src/utils/SafeTransferLib.sol";

import "../SStable.sol";

contract CAAD is SStable
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(string memory _name, string memory _symbol, uint8 _decimals, address _yieldaddress) 
        SStable(_name, _symbol, _decimals, _yieldaddress) {
    }
}
