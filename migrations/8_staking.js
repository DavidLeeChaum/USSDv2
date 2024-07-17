const USSD = artifacts.require("USSD");
const staking = artifacts.require("stUSSD");

module.exports = async function (deployer) {
  deployer.then(async () => {
    const USSDinstance = await USSD.deployed();
    console.log("USSD was deployed at address " + USSDinstance.address);
    const stakingInstance = await deployer.deploy(staking, USSDinstance.address, "Staked USSD", "stUSSD");
    console.log("stUSSD deployed at address " + stakingInstance.address);

    await USSDinstance.connectStaking.sendTransaction(stakingInstance.address);
  });
};
