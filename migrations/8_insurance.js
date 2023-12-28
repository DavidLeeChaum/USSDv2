const USSD = artifacts.require("USSD");
const staking = artifacts.require("ICT");

module.exports = async function (deployer) {
  const USSDinstance = await USSD.deployed();
  const insuranceInstance = await deployer.deploy(staking, USSDinstance.address, "Insurance Capital Treasury", "ICT");

  await USSDinstance.connectInsurance.sendTransaction(insuranceInstance.address);
};
