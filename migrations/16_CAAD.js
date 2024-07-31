const CAAD = artifacts.require("CAAD");

const StableOracleWETH = artifacts.require("StableOracleWETH");
const StableOracleUSSD = artifacts.require("StableOracleUSSD");
const StableOracleWBGL = artifacts.require("StableOracleWBGL");
const StableOracleWBTC = artifacts.require("StableOracleWBTC");
const StableOracleCAD = artifacts.require("StableOracleCAD");

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
    const OCAD = await StableOracleCAD.deployed();
    console.log("StableOracleCAD was deployed at address " + OCAD.address);

    const CAAD_instance = await deployer.deploy(CAAD, "Canadian Dollar Crypto Secured", "CAAD", 6, "0x0000000000000000000000000000000000000000");
    console.log("CAAD deployed at address " + CAAD_instance.address);

    await CAAD_instance.setOracles.sendTransaction(OCAD.address, OUSSD.address, OWBGL.address, OWBTC.address, OWETH.address);
  });
};
