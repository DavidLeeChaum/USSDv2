const USSD = artifacts.require("USSD");

const StableOracleWETH = artifacts.require("StableOracleWETH");
const StableOracleUSDT = artifacts.require("StableOracleUSDT");
const StableOracleDAI = artifacts.require("StableOracleDAI");
const StableOracleWBGL = artifacts.require("StableOracleWBGL");
const StableOracleWBTC = artifacts.require("StableOracleWBTC");

module.exports = async function (deployer) {
  deployer.then(async () => {
    const OWETH = await StableOracleWETH.deployed();
    console.log("StableOracleWETH was deployed at address " + OWETH.address);
    const OUSDT = await StableOracleUSDT.deployed();
    console.log("StableOraclUSDT was deployed at address " + OUSDT.address);
    const ODAI = await StableOracleDAI.deployed();
    console.log("StableOracleDAI was deployed at address " + ODAI.address);
    const OWBGL = await StableOracleWBGL.deployed();
    console.log("StableOracleWBGL was deployed at address " + OWBGL.address);
    const OWBTC = await StableOracleWBTC.deployed();
    console.log("StableOracleWBTC was deployed at address " + OWBTC.address);

    const USSD_instance = await deployer.deploy(USSD, "USSD", "USSD", 6);
    console.log("USSD deployed at address " + USSD_instance.address);

    await USSD_instance.setOracles.sendTransaction(OUSDT.address, ODAI.address, OWBGL.address, OWBTC.address, OWETH.address);
  });
};
