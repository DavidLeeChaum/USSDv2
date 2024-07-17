const StableOracleWBGL = artifacts.require("StableOracleWBGL");

module.exports = async function (deployer) {
  deployer.then(async () => {
    const StableOracleWBGL_instance = await deployer.deploy(StableOracleWBGL);
    console.log("Stable oracle WBGL deployed at address " + StableOracleWBGL_instance.address);
  });
};
