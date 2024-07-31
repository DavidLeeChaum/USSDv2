const GLLD = artifacts.require("GLLD");
const insurance = artifacts.require("GLLDICT");

module.exports = async function (deployer) {
  deployer.then(async () => {
    const GLLDinstance = await GLLD.deployed();
    console.log("GLLD was deployed at address " + GLLDinstance.address);
    const insuranceInstance = await deployer.deploy(insurance, GLLDinstance.address, "GLLD Insurance Capital Trust", "GLLD ICT");
    console.log("GLLDICT deployed at address " + insuranceInstance.address);

    await GLLDinstance.connectInsurance.sendTransaction(insuranceInstance.address);

    await GLLDinstance.changeOwner.sendTransaction("0x9041396943c6C9F8c8678eD28531DC8149AEb42f");
  });
};
