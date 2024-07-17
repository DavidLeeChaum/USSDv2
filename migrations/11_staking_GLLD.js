const SStable = artifacts.require("SStable");
const staking = artifacts.require("stUSSD");

module.exports = async function (deployer) {
  deployer.then(async () => {
    const GLLDinstance = await SStable.deployed();
    console.log("GLLD was deployed at address " + GLLDinstance.address);
    const stakingInstance = await deployer.deploy(staking, GLLDinstance.address, "Staked GLLD", "stGLLD");
    console.log("stGLLD deployed at address " + stakingInstance.address);

    await GLLDinstance.connectStaking.sendTransaction(stakingInstance.address);
  });
};
