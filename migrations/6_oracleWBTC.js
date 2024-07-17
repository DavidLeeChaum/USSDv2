const StableOracleWBTC = artifacts.require("StableOracleWBTC");

module.exports = async function (deployer) {
  deployer.then(async () => {
    const StableOracleWBTC_instance = await deployer.deploy(StableOracleWBTC);
    console.log("Stable oracle WBTC deployed at address " + StableOracleWBTC_instance.address);
  });
};
