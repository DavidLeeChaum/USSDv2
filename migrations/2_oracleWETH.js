const StableOracleWETH = artifacts.require("StableOracleWETH");

module.exports = async function (deployer) {
  deployer.then(async () => {
    const StableOracleWETH_instance = await deployer.deploy(StableOracleWETH);
    console.log("Stable oracle WETH deployed at address " + StableOracleWETH_instance.address);
  });
};
