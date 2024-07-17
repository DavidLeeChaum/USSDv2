const SStable = artifacts.require("SStable");
const staking = artifacts.require("ICT");

module.exports = async function (deployer) {
  deployer.then(async () => {
    const GLLDinstance = await SStable.deployed();
    console.log("USSD was deployed at address " + GLLDinstance.address);
    const insuranceInstance = await deployer.deploy(staking, GLLDinstance.address, "Insurance Capital Trust", "ICT");
    console.log("ICT deployed at address " + insuranceInstance.address);

    await GLLDinstance.connectInsurance.sendTransaction(insuranceInstance.address);
  });
};
