// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ERC20 } from "solmate/src/tokens/ERC20.sol";
import { SafeTransferLib } from "solmate/src/utils/SafeTransferLib.sol";

import "../stSStable.sol";

contract stCAAD is stSStable
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(
        ERC20 _USSD,
        string memory _name,
        string memory _symbol
    ) stSStable(_USSD, _name, _symbol) {
    }
}
