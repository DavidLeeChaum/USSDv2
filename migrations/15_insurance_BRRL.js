const BRRL = artifacts.require("BRRL");
const insurance = artifacts.require("BRRLICT");

module.exports = async function (deployer) {
  deployer.then(async () => {
    const BRRLinstance = await BRRL.deployed();
    console.log("BRRL was deployed at address " + BRRLinstance.address);
    const insuranceInstance = await deployer.deploy(insurance, BRRLinstance.address, "BRRL Insurance Capital Trust", "BRRL ICT");
    console.log("BRRLICT deployed at address " + insuranceInstance.address);

    await BRRLinstance.connectInsurance.sendTransaction(insuranceInstance.address);

    await BRRLinstance.changeOwner.sendTransaction("0xaA94bd8a27cf96e21552262bac71782dcA67148a");
  });
};
