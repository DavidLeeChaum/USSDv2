const StableOracleBRL = artifacts.require("StableOracleBRL");

module.exports = async function (deployer) {
  deployer.then(async () => {
    const StableOracleBRL_instance = await deployer.deploy(StableOracleBRL);
    console.log("Stable oracle BRL deployed at address " + StableOracleBRL_instance.address);
  });
};
