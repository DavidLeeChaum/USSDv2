const USSD = artifacts.require("USSD");

module.exports = function (deployer) {
  deployer.deploy(USSD, "Autonomous Secure Dollar", "USSD");
};
