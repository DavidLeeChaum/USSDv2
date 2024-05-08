const USSD = artifacts.require("USSD");
const yUSSD = artifacts.require("yUSSD");

module.exports = async function (deployer) {
  deployer.then(async () => {
    const USSDinstance = await USSD.deployed();
    console.log("USSD was deployed at address " + USSDinstance.address);
    const yUSSDInstance = await deployer.deploy(yUSSD, USSDinstance.address, "yield-bearing USSD", "yUSSD");
    console.log("yUSSD deployed at address " + yUSSDInstance.address);
  });
};
