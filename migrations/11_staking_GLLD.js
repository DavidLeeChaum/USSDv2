const GLLD = artifacts.require("GLLD");
const stGLLD = artifacts.require("stGLLD");

module.exports = async function (deployer) {
  deployer.then(async () => {
    const GLLDinstance = await GLLD.deployed();
    console.log("GLLD was deployed at address " + GLLDinstance.address);
    const stakingInstance = await deployer.deploy(stGLLD, GLLDinstance.address, "Staked GLLD", "stGLLD");
    console.log("stGLLD deployed at address " + stakingInstance.address);

    await GLLDinstance.connectStaking.sendTransaction(stakingInstance.address);
  });
};
