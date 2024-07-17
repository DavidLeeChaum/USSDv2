const StableOracleUSDT = artifacts.require("StableOracleUSDT");

module.exports = async function (deployer) {
  deployer.then(async () => {
    const StableOracleUSDT_instance = await deployer.deploy(StableOracleUSDT);
    console.log("Stable oracle USDT deployed at address " + StableOracleUSDT_instance.address);
  });
};
