// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./USSDRewards.sol";

import "./interfaces/ISStable.sol";

contract SStableRewards is USSDRewards {
    using SafeTransferLib for ERC20;
    using Cast for uint256;

    constructor(string memory name, string memory symbol, uint8 decimals, ERC20 _USSD, uint256 _targetAPY)
        USSDRewards(name, symbol, decimals, _USSD, _targetAPY)
    {}

    /// @notice Update the rewards per token accumulator according to the rate, the time elapsed since the last update, and the current total staked amount.
    function _calculateRewardsPerToken(RewardsPerToken memory rewardsPerTokenIn) override internal view returns(RewardsPerToken memory) {
        RewardsPerToken memory rewardsPerTokenOut = RewardsPerToken(rewardsPerTokenIn.accumulated, rewardsPerTokenIn.lastUpdated);
        (uint256 prevsupply, uint256 cf) = IUSSD(address(USSDToken)).prevSupplyAndCF();
        uint256 totalSupply_ = totalSupply;

        uint256 updateTime = block.timestamp;
        uint256 elapsed = updateTime - rewardsPerTokenIn.lastUpdated;
        
        // no changes if no time has passed
        if (elapsed == 0) return rewardsPerTokenOut;
        rewardsPerTokenOut.lastUpdated = updateTime.u32();
        
        // if there are no stakers we just change the last update time, the rewards for intervals without stakers are not accumulated
        if (totalSupply_ == 0) return rewardsPerTokenOut;

        // calculate and update the new value of the accumulator.
        // rewards are distributed only if collateral factor is > 1.05, but the whole collateral valuation is used to give rewards
        uint256 collateralValuation = 0;
        if (cf > 1050000000000000000) {
            collateralValuation = cf * prevsupply * ISStable(address(USSDToken)).getPriceUSD() / 1e24;
        }

        rewardsPerTokenOut.accumulated = (rewardsPerTokenIn.accumulated + 1e18 * (collateralValuation * elapsed * targetAPY / 1e18 * 1e18 / ISStable(address(USSDToken)).getPriceUSD()) / totalSupply_).u128(); // The rewards per token are scaled up for precision
        return rewardsPerTokenOut;
    }
}
