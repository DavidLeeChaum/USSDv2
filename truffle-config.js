const HDWalletProvider = require("@truffle/hdwallet-provider");

const private_key_production = "";

module.exports = {
  networks: {
    mainnet_fork: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: 1,         // Any network (default: none)
    },
    bsc_fork: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: 56,        // Any network (default: none)
    },
    live: {
      networkCheckTimeout: 10000,
      provider: function() {
        return new HDWalletProvider("", "https://eth.llamarpc.com")
        //return new HDWalletProvider(private_key_production, "https://rpc.eth.gateway.fm")
      },
      network_id: 1,
      gasPrice: 16500000000,  // 15.5 gwei (in wei) (default: 100 gwei)
      timeoutBlocks: 5000,    // the default web3 limitation of 750 seconds would still apply until truffle js is patched
    },
    bnb: {
      networkCheckTimeout: 10000,
      provider: function() {
        return new HDWalletProvider(private_key_production, "https://bsc-dataseed2.bnbchain.org")
      },
      network_id: 56,
      timeoutBlocks: 5000,    // the default web3 limitation of 750 seconds would still apply until truffle js is patched
    },
  },

  // Set default mocha options here, use special reporters, etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.6",
      settings: {
        optimizer: {
          enabled: false,
          runs: 200
        }
      }
    }
  },

  plugins: [
    "truffle-contract-size"
  ]
};
