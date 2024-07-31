const BRRL = artifacts.require("BRRL");
const stBRRL = artifacts.require("stBRRL");

module.exports = async function (deployer) {
  deployer.then(async () => {
    const BRRLinstance = await BRRL.deployed();
    console.log("BRRL was deployed at address " + BRRLinstance.address);
    const stakingInstance = await deployer.deploy(stBRRL, BRRLinstance.address, "Staked BRRL", "stBRRL");
    console.log("stBRRL deployed at address " + stakingInstance.address);

    await BRRLinstance.connectStaking.sendTransaction(stakingInstance.address);
  });
};
