const CAAD = artifacts.require("CAAD");
const stCAAD = artifacts.require("stCAAD");

module.exports = async function (deployer) {
  deployer.then(async () => {
    const CAADinstance = await CAAD.deployed();
    console.log("CAAD was deployed at address " + CAADinstance.address);
    const stakingInstance = await deployer.deploy(stCAAD, CAADinstance.address, "Staked CAAD", "stCAAD");
    console.log("stCAAD deployed at address " + stakingInstance.address);

    await CAADinstance.connectStaking.sendTransaction(stakingInstance.address);
  });
};
