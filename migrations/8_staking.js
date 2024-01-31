const USSD = artifacts.require("USSD");
const staking = artifacts.require("stUSSD");

module.exports = async function (deployer) {
  const USSDinstance = await USSD.deployed();
  const stakingInstance = await deployer.deploy(staking, USSDinstance.address, "Staked USSD", "stUSSD");

  await USSDinstance.connectStaking.sendTransaction(stakingInstance.address);
};
