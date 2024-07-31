const StableOracleUSSD = artifacts.require("StableOracleUSSD");

module.exports = async function (deployer) {
  deployer.then(async () => {
    const StableOracleUSSD_instance = await deployer.deploy(StableOracleUSSD);
    console.log("Stable oracle USSD deployed at address " + StableOracleUSSD_instance.address);
  });
};
