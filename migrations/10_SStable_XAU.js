const SStable = artifacts.require("SStable");

const StableOracleWETH = artifacts.require("StableOracleWETH");
const StableOracleUSSD = artifacts.require("StableOracleUSSD");
const StableOracleWBGL = artifacts.require("StableOracleWBGL");
const StableOracleWBTC = artifacts.require("StableOracleWBTC");
const StableOracleXAU = artifacts.require("StableOracleXAU");

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
    const OXAU = await StableOracleXAU.deployed();
    console.log("StableOracleXAU was deployed at address " + OXAU.address);

    const GLLD_instance = await deployer.deploy(SStable, "Secure Gold", "GLLD", 6, 0);
    console.log("GLLD deployed at address " + GLLD_instance.address);

    await GLLD_instance.setOracles.sendTransaction(OXAU.address, OUSSD.address, OWBGL.address, OWBTC.address, OWETH.address);
    await GLLD_instance.changeOwner.sendTransaction("0x9041396943c6C9F8c8678eD28531DC8149AEb42f");
  });
};
