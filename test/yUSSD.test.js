const { expect } = require('chai');
const { time } = require('@openzeppelin/test-helpers');
const truffleAssert = require('truffle-assertions');

// common utils for test preparations
const { prepareAssets, prepareOracles } = require('./utils/preparations.js');
const { cmpnum } = require('./utils/numstringcompare.js');

const USSD = artifacts.require('USSD');
const yUSSD = artifacts.require('yUSSD');
const ICT = artifacts.require('ICT');

const SimOracle = artifacts.require('SimOracle'); // these are mock oracles used for simulation run

const StableOracleWBTC = artifacts.require('StableOracleWBTC');
const StableOracleWETH = artifacts.require('StableOracleWETH');
const StableOracleUSDT = artifacts.require('StableOracleUSDT');
const StableOracleWBGL = artifacts.require('StableOracleWBGL');


contract('yUSSD (yield-bearing USSD, rewards program)', async function (accounts) {
  beforeEach(async function () {
    this.USSD = await USSD.new("US Secured Dollar", "USSD", 6, { from: accounts[0] });
    this.yUSSD = await yUSSD.new(this.USSD.address, "yUSSD", "yUSSD", { from: accounts[0] });
    await this.USSD.connectStaking(this.yUSSD.address);
  });
 
  // note: probably due to gas optimizations in solmate/rewards contracts
  // gas limit needs to be specified, otherwise reverts semi-randomly occur
  it('USSD could be staked, pays premiums and could be unstaked', async function() {
    await prepareAssets(accounts);

    await prepareOracles(this, accounts);
    console.log("Oracles prepared");

    const USDT = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9';
    const USDTABI = '[{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"_decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]';
    let USDTContract = new web3.eth.Contract(JSON.parse(USDTABI), USDT);
    
    const WETH = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';
    const WETHABI = '[{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"_decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]';
    let WETHContract = new web3.eth.Contract(JSON.parse(WETHABI), WETH);

    await USDTContract.methods.approve(this.USSD.address, web3.utils.toBN('1000000000000000000000')).send({ from: accounts[0] });
    await WETHContract.methods.approve(this.USSD.address, web3.utils.toBN('1000000000000000000000')).send({ from: accounts[0] });

    // must be minted with stables first
    await truffleAssert.reverts(this.USSD.mintForToken(WETH, web3.utils.toBN('100000000000000000'), accounts[1], { from: accounts[0] }), "STABLE only");
    
    await this.USSD.mintForToken(USDT, web3.utils.toBN('100000000'), accounts[1], { from: accounts[0] });
    console.log("Minted 100.0 USSD for 100.0 USDT");

    expect((await this.USSD.balanceOf(accounts[1])).toString()).to.equal('100000000');

    // if stables are more than 5% and BTC winter, expect WBTC/WETH
    await truffleAssert.reverts(this.USSD.mintForToken(USDT, web3.utils.toBN('100000000'), accounts[1], { from: accounts[0] }), "WBTCorWETH");
    
    await this.USSD.mintForToken(WETH, web3.utils.toBN('100000000000000000'), accounts[1], { from: accounts[0] });
    console.log("Minted 250.0 USSD for 0.1 WETH");

    expect((await this.USSD.balanceOf(accounts[1])).toString()).to.equal('350000000');

    expect((await this.USSD.totalSupply()).toString()).to.equal('350000000');

    expect((await this.USSD.collateralFactor()).toString()).to.equal('1000000000000000000');

    // stake USSD
    await truffleAssert.reverts(this.yUSSD.deposit(web3.utils.toBN('100000000'), accounts[0], { from: accounts[0] }), "TRANSFER_FROM_FAILED");
    await truffleAssert.reverts(this.yUSSD.deposit(web3.utils.toBN('100000000'), accounts[1], { from: accounts[1] }), "TRANSFER_FROM_FAILED");

    await this.USSD.approve(this.yUSSD.address, web3.utils.toBN('1000000000000000000000'), { from: accounts[1] });
    await this.yUSSD.deposit(web3.utils.toBN('100000000'), accounts[1], { from: accounts[1] });
    expect((await this.yUSSD.totalSupply()).toString()).to.equal('100000000000000000000');

    await this.oracleWETH.setPriceUSD(web3.utils.toBN('5000000000000000000000'), { from: accounts[0] });

    expect((await this.USSD.collateralFactor()).toString()).to.equal('1714285714285714285');

    // as we operate with totalSupply and CF number after mint in previous block (for protection)
    // update block and call mint of 0 tokens
    await this.USSD.mintForToken(WETH, web3.utils.toBN('0'), accounts[1], { from: accounts[0] }); // to set as current
    await time.advanceBlock();
    await this.USSD.mintForToken(WETH, web3.utils.toBN('0'), accounts[1], { from: accounts[0] }); // to update prev mint block state vars

    const ts = (await time.latest()).toNumber();
    console.log("Current timestamp is: ", ts.toString());
    // 20 USSD distributed over period of 2 weeks
    // we must provide from accounts[0] as a deployer
    await this.USSD.transfer(accounts[0], web3.utils.toBN('20000000'), { from: accounts[1] });
    await this.USSD.approve(this.yUSSD.address, web3.utils.toBN('1000000000000000000000'), { from: accounts[0] });
    await this.yUSSD.setRewardsInterval(ts, ts + 3600 * 24 * 14 /* 2 weeks */, web3.utils.toBN('20000000'), { from: accounts[0] });

    // now we can get some premium, but we need for time to pass
    expect((await this.yUSSD.currentUserRewards(accounts[0])).toString()).to.equal('0');
    expect((await this.yUSSD.currentUserRewards(accounts[1])).toString().length).to.be.lessThan(3); // some small number could appear due to int rounding

    await time.increase(7 * 24 * 3600); // pass a week
    await time.advanceBlock();

    // rewards are 10.0 for a week for all
    //expect((await this.yUSSD.currentUserRewards(accounts[1])).toString()).to.equal('10000000');
    const currewards = (await this.yUSSD.currentUserRewards(accounts[1])).toString();
    if (currewards.length == 8) {
        expect(cmpnum(currewards, '10000000', 4)).to.be.true;
    } else if (currewards.length == 7) {
        expect(cmpnum(currewards, '9999999', 4)).to.be.true;
    }
    
    await this.yUSSD.claim(accounts[1], { from: accounts[1] });
    //expect((await this.USSD.balanceOf(accounts[1])).toString()).to.equal('241000000');
    expect(cmpnum((await this.USSD.balanceOf(accounts[1])).toString(), '240000000', 5)).to.be.true;

    // add second staker
    await this.USSD.transfer(accounts[2], web3.utils.toBN('100000000'), { from: accounts[1] });
    await this.USSD.approve(this.yUSSD.address, web3.utils.toBN('1000000000000000000000'), { from: accounts[2] });
    expect((await this.yUSSD.totalSupply()).toString()).to.equal('100000000000000000000');
    expect(cmpnum((await this.yUSSD.stakedAssets()).toString(), '100000000', 4)).to.be.true;
    await time.advanceBlock();
    await this.yUSSD.deposit(web3.utils.toBN('100000000'), accounts[2], { from: accounts[2], gas: 5000000 });
    expect(cmpnum((await this.yUSSD.totalSupply()).toString(), '200000000000000000000', 4)).to.be.true;
    expect(cmpnum((await this.yUSSD.stakedAssets()).toString(), '200000000', 4)).to.be.true;

    await time.increase(7 * 24 * 3600); // pass a week
    await time.advanceBlock();

    // each staker gets half 5.0 (10 for 2nd week)
    //expect((await this.yUSSD.currentUserRewards(accounts[1])).toString()).to.equal('5000000');
    expect(cmpnum((await this.yUSSD.currentUserRewards(accounts[1])).toString(), '5000000', 3)).to.be.true;
    //expect((await this.yUSSD.currentUserRewards(accounts[2])).toString()).to.equal('5000000');
    expect(cmpnum((await this.yUSSD.currentUserRewards(accounts[2])).toString(), '5000000', 3)).to.be.true;
    await this.yUSSD.claim(accounts[1], { from: accounts[1], gas: 5000000 });
    expect((await this.yUSSD.currentUserRewards(accounts[1])).toString()).to.equal('0');
    expect(cmpnum((await this.yUSSD.currentUserRewards(accounts[2])).toString(), '5000000', 3)).to.be.true;
    await this.yUSSD.claim(accounts[2], { from: accounts[2], gas: 5000000 });
    expect(cmpnum((await this.USSD.balanceOf(accounts[1])).toString(), '145000000', 5)).to.be.true;
    //expect((await this.USSD.balanceOf(accounts[2])).toString()).to.equal('4761897');
    expect(cmpnum((await this.USSD.balanceOf(accounts[2])).toString(), '5000000', 4)).to.be.true;
    
    // second staker withdraws
    expect((await this.yUSSD.balanceOf(accounts[1])).toString()).to.equal('100000000000000000000');
    await time.advanceBlock();
    await this.yUSSD.withdraw(web3.utils.toBN('50000000'), accounts[2], accounts[2], { from: accounts[2], gas: 5000000 });
    await time.advanceBlock();
    //expect((await this.yUSSD.balanceOf(accounts[2])).toString()).to.equal('43181828337811375215');
    expect(cmpnum((await this.yUSSD.balanceOf(accounts[2])).toString(), '50000000000000000000', 4)).to.be.true;
    await this.yUSSD.redeem(web3.utils.toBN('50000000000000000000'), accounts[2], accounts[2], { from: accounts[2], gas: 5000000 });
    //expect((await this.yUSSD.balanceOf(accounts[2])).toNumber()).to.equal('0'); // completely unstaked

    //expect((await this.USSD.balanceOf(accounts[2])).toString()).to.equal('105000000');
    expect(cmpnum((await this.USSD.balanceOf(accounts[2])).toString(), '105000000', 4)).to.be.true;
    // no USSD was created out of thin air, supply remains the same
    expect(cmpnum((await this.USSD.totalSupply()).toString(), '350000000', 6)).to.be.true;
  });
});
