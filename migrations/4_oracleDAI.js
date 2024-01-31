const StableOracleDAI = artifacts.require("StableOracleDAI");

module.exports = function (deployer) {
  const StableOracleDAI_instance = deployer.deploy(StableOracleDAI);
  console.log("Stable oracle DAI deployed at address " + StableOracleDAI_instance.address);
};
