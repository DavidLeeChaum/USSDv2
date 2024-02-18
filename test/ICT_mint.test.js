const { expect } = require('chai');
const { time } = require('@openzeppelin/test-helpers');
const truffleAssert = require('truffle-assertions');

// common utils for test preparations
const { prepareAssets, prepareInsuranceAssets, prepareOracles } = require('./utils/preparations.js');
const { cmpnum } = require('./utils/numstringcompare.js');

const USSD = artifacts.require('USSD');
const stUSSD = artifacts.require('stUSSD');
const ICT = artifacts.require('ICT');

const SimOracle = artifacts.require('SimOracle'); // these are mock oracles used for simulation run

const StableOracleWBTC = artifacts.require('StableOracleWBTC');
const StableOracleWETH = artifacts.require('StableOracleWETH');
const StableOracleUSDT = artifacts.require('StableOracleUSDT');
const StableOracleWBGL = artifacts.require('StableOracleWBGL');


contract('ICT (insurance capital trust)', async function (accounts) {
  beforeEach(async function () {
    this.USSD = await USSD.new("US Secured Dollar", "USSD", 6, { from: accounts[0] });
    this.stUSSD = await stUSSD.new(this.USSD.address, "Staked USSD", "stUSSD", { from: accounts[0] });
    this.ICT = await ICT.new(this.USSD.address, "Insurance Capital Trust", "ICT", { from: accounts[0] });
    await this.USSD.connectStaking(this.stUSSD.address);
    await this.USSD.connectInsurance(this.ICT.address);
  });
 
  it('ICT could be minted for WBGL, pays USSD premiums', async function() {
    await prepareAssets(accounts, true, false);

    await prepareOracles(this, accounts);
    console.log("Oracles prepared");

    const USDT = '0x55d398326f99059fF775485246999027B3197955';
    const USDTABI = '[{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"_decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]';
    let USDTContract = new web3.eth.Contract(JSON.parse(USDTABI), USDT);
    
    const WETH = '0x2170Ed0880ac9A755fd29B2688956BD959F933F8';
    const WETHABI = '[{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"_decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]';
    let WETHContract = new web3.eth.Contract(JSON.parse(WETHABI), WETH);

    const WBGL = '0x2bA64EFB7A4Ec8983E22A49c81fa216AC33f383A';
    const WBGLABI = '[{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"_decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]';
    let WBGLContract = new web3.eth.Contract(JSON.parse(WBGLABI), WBGL);

    await USDTContract.methods.approve(this.USSD.address, web3.utils.toBN('1000000000000000000000')).send({ from: accounts[0] });
    await WETHContract.methods.approve(this.USSD.address, web3.utils.toBN('1000000000000000000000')).send({ from: accounts[0] });

    // must be minted with stables first
    await truffleAssert.reverts(this.USSD.mintForToken(WETH, web3.utils.toBN('1000000000000000000'), accounts[1], { from: accounts[0] }), "STABLE only");
    
    await this.USSD.mintForToken(USDT, web3.utils.toBN('100000000000000000000'), accounts[2], { from: accounts[0] });
    console.log("Minted 100.0 USSD for 100.0 USDT");

    expect((await this.USSD.balanceOf(accounts[2])).toString()).to.equal('100000000');

    // if stables are more than 5% and BTC winter, expect WBTC/WETH
    await truffleAssert.reverts(this.USSD.mintForToken(USDT, web3.utils.toBN('1000000000000000000'), accounts[1], { from: accounts[0] }), "WBTCorWETH");
    
    await this.USSD.mintForToken(WETH, web3.utils.toBN('100000000000000000'), accounts[2], { from: accounts[0] });
    console.log("Minted 250.0 USSD for 0.1 WETH");

    expect((await this.USSD.balanceOf(accounts[2])).toString()).to.equal('350000000');

    expect((await this.USSD.totalSupply()).toString()).to.equal('350000000');

    expect((await this.USSD.collateralFactor()).toString()).to.equal('1000000000000000000');

    // lock WBGL
    await truffleAssert.reverts(this.ICT.mintWETH(web3.utils.toBN('100000000'), accounts[0], { from: accounts[0] }), "WBGL only");
    await truffleAssert.reverts(this.ICT.mintWBGL(web3.utils.toBN('100000000'), accounts[1], { from: accounts[1] }), "TRANSFER_FROM_FAILED");

    await WBGLContract.methods.approve(this.ICT.address, web3.utils.toBN('1000000000000000000000')).send({ from: accounts[0] });
    // 10 WBGL
    await this.ICT.mintWBGL(web3.utils.toBN('10000000000000000000'), accounts[0], { from: accounts[0] });

    await this.oracleWETH.setPriceUSD(web3.utils.toBN('5000000000000000000000'), { from: accounts[0] });

    expect((await this.USSD.collateralFactor()).toString()).to.equal('1714285714285714285');

    // as we operate with totalSupply and CF number after mint in previous block (for protection)
    // update block and call mint of 0 tokens
    await this.USSD.mintForToken(WETH, web3.utils.toBN('0'), accounts[2], { from: accounts[0] }); // to set as current
    await time.advanceBlock();
    await this.USSD.mintForToken(WETH, web3.utils.toBN('0'), accounts[2], { from: accounts[0] }); // to update prev mint block state vars

    // now we can get some premium, but we need for time to pass
    expect((await this.ICT.currentUserRewards(accounts[0])).toString()).to.equal('0');
    expect((await this.ICT.currentUserRewards(accounts[1])).toString()).to.equal('0');
    expect((await this.ICT.balanceOf(accounts[0])).toString()).to.equal('10000000000000000000');

    await time.increase(7 * 24 * 3600); // pass a week
    await time.advanceBlock();

    // total supply 350.0 * 1.714285 collateral factor * 7/365 time passed * 4.2% Expected APY =  total premium for all stakers (there only one)
    // 350.0 * 1.714285 * 7/365 * 0.042 = 0.483287 USSD premium minted/paid
    // it would vary on seconds/of the running simulation, so check approximately

    expect(cmpnum((await this.ICT.currentUserRewards(accounts[0])).toString(), '483287', 4)).to.be.true;
    
    await this.ICT.claim(accounts[0], { from: accounts[0] });
    expect(cmpnum((await this.USSD.balanceOf(accounts[0])).toString(), '483287', 4)).to.be.true;


    // add second staker
    await WBGLContract.methods.transfer(accounts[1], web3.utils.toBN('10000000000000000000')).send({ from: accounts[0] });
    await WBGLContract.methods.approve(this.ICT.address, web3.utils.toBN('1000000000000000000000')).send({ from: accounts[1] });

    expect((await this.ICT.totalSupply()).toString()).to.equal('10000000000000000000');
    await this.ICT.mintWBGL(web3.utils.toBN('10000000000000000000'), accounts[1], { from: accounts[1], gas: 5000000 });
    expect((await this.ICT.totalSupply()).toString()).to.equal('20000000000000000000');

    await time.increase(7 * 24 * 3600); // pass a week
    await time.advanceBlock();

    // each staker gets half
    expect(cmpnum((await this.ICT.currentUserRewards(accounts[0])).toString(), '241643', 3)).to.be.true;
    expect(cmpnum((await this.ICT.currentUserRewards(accounts[1])).toString(), '241643', 3)).to.be.true;
    await this.ICT.claim(accounts[0], { from: accounts[0], gas: 5000000 });
    expect((await this.ICT.currentUserRewards(accounts[0])).toString()).to.equal('0');
    expect(cmpnum((await this.ICT.currentUserRewards(accounts[1])).toString(), '241643', 3)).to.be.true;
    await this.ICT.claim(accounts[1], { from: accounts[1], gas: 5000000 });
    // minted USSD is on accounts[2], these are only rewards on accounts[0] and accounts[1]
    expect(cmpnum((await this.USSD.balanceOf(accounts[0])).toString(), '724930', 3)).to.be.true;
    expect(cmpnum((await this.USSD.balanceOf(accounts[1])).toString(), '241643', 3)).to.be.true;

    // drop collateral factor (WETH price decrease)
    await this.oracleWETH.setPriceUSD(web3.utils.toBN('1000000000000000000000'), { from: accounts[0] });

    // collateral factor is also fluctuating as total supply fluctuates based on rewards claimed
    expect(cmpnum((await this.USSD.collateralFactor()).toString(), '569854834267750898', 6)).to.be.true;
  });


});
