const StableOracleCAD = artifacts.require("StableOracleCAD");

module.exports = async function (deployer) {
  deployer.then(async () => {
    const StableOracleCAD_instance = await deployer.deploy(StableOracleCAD);
    console.log("Stable oracle CAD deployed at address " + StableOracleCAD_instance.address);
  });
};
