const CAAD = artifacts.require("CAAD");
const insurance = artifacts.require("CAADICT");

module.exports = async function (deployer) {
  deployer.then(async () => {
    const CAADinstance = await CAAD.deployed();
    console.log("CAAD was deployed at address " + CAADinstance.address);
    const insuranceInstance = await deployer.deploy(insurance, CAADinstance.address, "CAAD Insurance Capital Trust", "CAAD ICT");
    console.log("CAADICT deployed at address " + insuranceInstance.address);

    await CAADinstance.connectInsurance.sendTransaction(insuranceInstance.address);

    await CAADinstance.changeOwner.sendTransaction("0xBF9F500cf8Efc4d2ef395043E5e83D4793028067");
  });
};
