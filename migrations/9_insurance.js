const USSD = artifacts.require("USSD");
const staking = artifacts.require("ICT");

module.exports = async function (deployer) {
  deployer.then(async () => {
    const USSDinstance = await USSD.deployed();
    console.log("USSD was deployed at address " + USSDinstance.address);
    const insuranceInstance = await deployer.deploy(staking, USSDinstance.address, "Insurance Capital Trust", "ICT");
    console.log("ICT deployed at address " + insuranceInstance.address);

    await USSDinstance.connectInsurance.sendTransaction(insuranceInstance.address);
  });
};
