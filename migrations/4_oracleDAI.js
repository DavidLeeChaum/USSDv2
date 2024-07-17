const StableOracleDAI = artifacts.require("StableOracleDAI");

module.exports = async function (deployer) {
  deployer.then(async () => {
    const StableOracleDAI_instance = await deployer.deploy(StableOracleDAI);
    console.log("Stable oracle DAI deployed at address " + StableOracleDAI_instance.address);
  });
};
