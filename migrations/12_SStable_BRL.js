const SStable = artifacts.require("SStable");

const StableOracleWETH = artifacts.require("StableOracleWETH");
const StableOracleUSSD = artifacts.require("StableOracleUSSD");
const StableOracleWBGL = artifacts.require("StableOracleWBGL");
const StableOracleWBTC = artifacts.require("StableOracleWBTC");
const StableOracleBRL = artifacts.require("StableOracleBRL");

module.exports = async function (deployer) {
  deployer.then(async () => {
    const OWETH = await StableOracleWETH.deployed();
    console.log("StableOracleWETH was deployed at address " + OWETH.address);
    const OUSSD = await StableOracleUSSD.deployed();
    console.log("StableOracleUSSD was deployed at address " + OUSSD.address);
    const OWBTC = await StableOracleWBTC.deployed();
    console.log("StableOracleWBTC was deployed at address " + OWBTC.address);
    const OWBGL = await StableOracleWBGL.deployed();
    console.log("StableOracleWBGL was deployed at address " + OWBGL.address);
    const OBRL = await StableOracleBRL.deployed();
    console.log("StableOracleBRL was deployed at address " + OBRL.address);

    const BRRL_instance = await deployer.deploy(SStable, "Secure Real", "BRRL", 6, "0x16e58F04F9ebEd3134cb4d19D48bB810346c1778");
    console.log("BRRL deployed at address " + BRRL_instance.address);

    await BRRL_instance.setOracles.sendTransaction(OBRL.address, OUSSD.address, OWBGL.address, OWBTC.address, OWETH.address);
    await GLLD_instance.changeOwner.sendTransaction("0xaA94bd8a27cf96e21552262bac71782dcA67148a");
  });
};
