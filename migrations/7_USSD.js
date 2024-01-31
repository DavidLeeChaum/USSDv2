const USSD = artifacts.require("USSD");

module.exports = function (deployer) {
  deployer.deploy(USSD, "USSD", "USSD", 6);
};
