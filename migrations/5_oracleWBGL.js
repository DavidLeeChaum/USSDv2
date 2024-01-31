const StableOracleWBGL = artifacts.require("StableOracleWBGL");

module.exports = function (deployer) {
  const StableOracleWBGL_instance = deployer.deploy(StableOracleWBGL);
  console.log("Stable oracle WBGL deployed at address " + StableOracleWBGL_instance.address);
};
