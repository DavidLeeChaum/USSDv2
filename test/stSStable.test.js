const { expect } = require('chai');
const { time } = require('@openzeppelin/test-helpers');
const truffleAssert = require('truffle-assertions');

// common utils for test preparations
const { prepareAssetsSStable, prepareOraclesSStable } = require('./utils/preparations.js');
const { cmpnum } = require('./utils/numstringcompare.js');

const SStable = artifacts.require('SStable');
const stSStable = artifacts.require('stSStable');
const ICT = artifacts.require('ICT');

const SimOracle = artifacts.require('SimOracle'); // these are mock oracles used for simulation run

const StableOracleWBTC = artifacts.require('StableOracleWBTC');
const StableOracleWETH = artifacts.require('StableOracleWETH');
const StableOracleUSDT = artifacts.require('StableOracleUSDT');
const StableOracleWBGL = artifacts.require('StableOracleWBGL');


contract('stSStable (staked SStable, rewards program)', async function (accounts) {
  beforeEach(async function () {
    this.SStable = await SStable.new("US Secured SStable", "SStable", 6, "0x0000000000000000000000000000000000000000", { from: accounts[0] });
    this.stSStable = await stSStable.new(this.SStable.address, "Staked SStable", "stSStable", { from: accounts[0] });
    await this.SStable.connectStaking(this.stSStable.address);
  });
 
  // note: probably due to gas optimizations in solmate/rewards contracts
  // gas limit needs to be specified, otherwise reverts semi-randomly occur
  it('SStable could be staked, pays premiums and could be unstaked', async function() {
    await prepareAssetsSStable(accounts, false, true);

    await prepareOraclesSStable(this, accounts);
    console.log("Oracles prepared");

    const USSD = '0x33C88D4caC6aC34F77020915a2a88cd0417dC069';
    const USSDABI = '[{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"_decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]';
    let USSDContract = new web3.eth.Contract(JSON.parse(USSDABI), USSD);
    
    const WETH = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';
    const WETHABI = '[{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"_decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]';
    let WETHContract = new web3.eth.Contract(JSON.parse(WETHABI), WETH);

    await USSDContract.methods.approve(this.SStable.address, web3.utils.toBN('1000000000000000000000')).send({ from: accounts[0] });
    await WETHContract.methods.approve(this.SStable.address, web3.utils.toBN('1000000000000000000000')).send({ from: accounts[0] });

    // must be minted with stables first
    await truffleAssert.reverts(this.SStable.mintForToken(WETH, web3.utils.toBN('100000000000000000'), accounts[1], { from: accounts[0] }), "USSD only");
    
    await this.SStable.mintForToken(USSD, web3.utils.toBN('10000000'), accounts[1], { from: accounts[0] });
    console.log("Minted 5.0 SStable for 10.0 USSD");

    expect((await this.SStable.balanceOf(accounts[1])).toString()).to.equal('5000000');

    // if stables are more than 5% and BTC winter, expect WBTC/WETH
    await truffleAssert.reverts(this.SStable.mintForToken(USSD, web3.utils.toBN('1000000'), accounts[1], { from: accounts[0] }), "WBTCorWETH");
    
    await this.SStable.mintForToken(WETH, web3.utils.toBN('10000000000000000'), accounts[1], { from: accounts[0] });
    console.log("Minted 12.5 USSD for 0.01 WETH");

    expect((await this.SStable.balanceOf(accounts[1])).toString()).to.equal('17500000');

    expect((await this.SStable.totalSupply()).toString()).to.equal('17500000');

    expect((await this.SStable.collateralFactor()).toString()).to.equal('1000000000000000000');

    // stake SStable
    await truffleAssert.reverts(this.stSStable.deposit(web3.utils.toBN('100000000'), accounts[0], { from: accounts[0] }), "TRANSFER_FROM_FAILED");
    await truffleAssert.reverts(this.stSStable.deposit(web3.utils.toBN('100000000'), accounts[1], { from: accounts[1] }), "TRANSFER_FROM_FAILED");

    await this.SStable.approve(this.stSStable.address, web3.utils.toBN('1000000000000000000000'), { from: accounts[1] });
    await this.stSStable.deposit(web3.utils.toBN('10000000'), accounts[1], { from: accounts[1] });
    expect((await this.stSStable.totalSupply()).toString()).to.equal('10000000000000000000');

    await this.oracleWETH.setPriceUSD(web3.utils.toBN('5000000000000000000000'), { from: accounts[0] });

    expect((await this.SStable.collateralFactor()).toString()).to.equal('1714285714285714285');

    // as we operate with totalSupply and CF number after mint in previous block (for protection)
    // update block and call mint of 0 tokens
    await this.SStable.mintForToken(WETH, web3.utils.toBN('0'), accounts[1], { from: accounts[0] }); // to set as current
    await time.advanceBlock();
    await this.SStable.mintForToken(WETH, web3.utils.toBN('0'), accounts[1], { from: accounts[0] }); // to update prev mint block state vars

    // now we can get some premium, but we need for time to pass
    expect((await this.stSStable.currentUserRewards(accounts[0])).toString()).to.equal('0');
    //expect((await this.stUSSD.currentUserRewards(accounts[1])).toString()).to.equal('0');

    await time.increase(7 * 24 * 3600); // pass a week
    await time.advanceBlock();

    // total supply $35.0 * 1.714285 collateral factor * 7/365 time passed * 1.8% Expected APY = total premium for all stakers (there only one)
    // 35.0 * 1.714285 * 7/365 * 0.018 = 0.0207123 USD premium minted/paid
    // it would vary on seconds/of the running simulation, so check approximately
    // 17.5 - 10 staked = 7.5 + 0.0207 in rewards (0.010366 tokens)

    //expect((await this.stSStable.currentUserRewards(accounts[1])).toString()).to.equal('10356');
    expect(cmpnum((await this.stSStable.currentUserRewards(accounts[1])).toString(), '10356', 4)).to.be.true;
    
    await this.stSStable.claim(accounts[1], { from: accounts[1] });
    //expect((await this.SStable.balanceOf(accounts[1])).toString()).to.equal('7510356');
    expect(cmpnum((await this.SStable.balanceOf(accounts[1])).toString(), '7510356', 6)).to.be.true;

    // add second staker
    /*await this.USSD.transfer(accounts[2], web3.utils.toBN('100000000'), { from: accounts[1] });
    await this.USSD.approve(this.stUSSD.address, web3.utils.toBN('1000000000000000000000'), { from: accounts[2] });
    expect((await this.stUSSD.totalSupply()).toString()).to.equal('100000000000000000000');
    expect((await this.stUSSD.totalAssets()).toString()).to.equal('100000000');
    await time.advanceBlock();
    await this.stUSSD.deposit(web3.utils.toBN('100000000'), accounts[2], { from: accounts[2], gas: 5000000 });
    expect((await this.stUSSD.totalSupply()).toString()).to.equal('200000000000000000000');
    expect((await this.stUSSD.totalAssets()).toString()).to.equal('200000000');

    await time.increase(7 * 24 * 3600); // pass a week
    await time.advanceBlock();

    // each staker gets half
    expect(cmpnum((await this.stUSSD.currentUserRewards(accounts[1])).toString(), '103561', 3)).to.be.true;
    expect(cmpnum((await this.stUSSD.currentUserRewards(accounts[2])).toString(), '103561', 3)).to.be.true;
    await this.stUSSD.claim(accounts[1], { from: accounts[1], gas: 5000000 });
    expect((await this.stUSSD.currentUserRewards(accounts[1])).toString()).to.equal('0');
    expect(cmpnum((await this.stUSSD.currentUserRewards(accounts[2])).toString(), '103561', 3)).to.be.true;
    await this.stUSSD.claim(accounts[2], { from: accounts[2], gas: 5000000 });
    expect(cmpnum((await this.USSD.balanceOf(accounts[1])).toString(), '150310684', 6)).to.be.true;
    expect(cmpnum((await this.USSD.balanceOf(accounts[2])).toString(), '103561', 3)).to.be.true;
    
    // second staker withdraws
    expect((await this.stUSSD.balanceOf(accounts[1])).toString()).to.equal('100000000000000000000');
    await time.advanceBlock();
    await this.stUSSD.redeem(web3.utils.toBN('50000000000000000000'), accounts[2], accounts[2], { from: accounts[2], gas: 5000000 });
    await time.advanceBlock();
    await this.stUSSD.withdraw(web3.utils.toBN('50000000'), accounts[2], accounts[2], { from: accounts[2], gas: 5000000 });
    expect((await this.stUSSD.balanceOf(accounts[2])).toString()).to.equal('0'); // completely unstaked

    expect((await this.USSD.balanceOf(accounts[2])).toString()).to.equal('100103561');
    expect(cmpnum((await this.USSD.balanceOf(accounts[2])).toString(), '100103561', 6)).to.be.true;
    expect(cmpnum((await this.USSD.totalSupply()).toString(), '350414245', 6)).to.be.true;
    */
  });
});
