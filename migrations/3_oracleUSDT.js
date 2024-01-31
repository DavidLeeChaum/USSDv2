const StableOracleUSDT = artifacts.require("StableOracleUSDT");

module.exports = function (deployer) {
  const StableOracleUSDT_instance = deployer.deploy(StableOracleUSDT);
  console.log("Stable oracle USDT deployed at address " + StableOracleUSDT_instance.address);
};
