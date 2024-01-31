# USSD (v2)

Autonomous stablecoin with crypto collateralization.

# Contracts audit scope

* USSD.sol -- main token (stablecoin)
* USSDRewards.sol
* stUSSD.sol -- staking vault
* ICT.sol -- insurance token

* interfaces/IStableOracle.sol
* interfaces/IStaticOracle
* interfaces/IUSSD
* interfaces/IUSSDInsurance

* oracles/StableOracleUSDT
* oracles/StableOracleWBGL
* oracles/StableOracleWBTC
* oracles/StableOracleWETH

* oracles/UniswapV3StaticOracle.sol - out of scope, it's from
  https://github.com/Mean-Finance/uniswap-v3-oracle/blob/main/solidity/contracts/StaticOracle.sol


#### Testing

Tests are aimed to be ran on a fork of BNB chain (formerly BSC). To create a ganache fork, init and start it
using your preferred js package manager, with package.json like this:
```
{
  "name": "ganache",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "scripts": {
    "ganache": "ganache --fork.url https://mainnet.infura.io/v3/yourapikey",
    "ganachebsc": "ganache --fork.url https://bsc-dataseed2.bnbchain.org"
  },
  "dependencies": {
    "ganache": "^7.8.0"
  }
}
```

Now if you populate node_modules and run it with e.g. `yarn run ganachebsc`, it will spin up local BNB fork at port 8545.

Then run Truffle with
`yarn truffle console --network=bsc_fork`
and then run tests with `test` command.

Please note: tests use real addresses of WETH, WBTC, etc., so tokens are swapped using BNB balance on
addresses provided by ganache when forking a network.

Tests modify blockchain state and are not intended to be run multiple time on a single network fork (due to finite balances
on provided addresses and altering network blocks/timestamp).

If errors are encountered similar to 'missing trie node', please separate tests into several runs, as
probably ganache starts to bug out after sequential test tuns.
