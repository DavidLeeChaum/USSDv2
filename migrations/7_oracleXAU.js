const StableOracleXAU = artifacts.require("StableOracleXAU");

module.exports = async function (deployer) {
  deployer.then(async () => {
    const StableOracleXAU_instance = await deployer.deploy(StableOracleXAU);
    console.log("Stable oracle XAU deployed at address " + StableOracleXAU_instance.address);
  });
};
