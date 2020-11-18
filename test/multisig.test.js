const MultisigWallet = artifacts.require("MultisigWallet.sol");
const TestToken = artifacts.require("TestToken.sol");
const BN = require('bn.js');
const w3utils = require('web3-utils');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

const expectRevert = async promise => {
  try {
    await promise;
    assert.fail('Expected revert not received');
  } catch (error) {
    const revertFound = error.message.search('revert') >= 0;
    assert(revertFound, `Expected "revert", got ${error} instead`);
  }
};

contract('MultisigWallet', async ([owner0, owner1, owner2, notOwner]) => {

  describe('# MultisigWallet basic functions', async () => {
    it ("should deploy multisig with correct number of owners and required signatures", async () => {
      const wallet = await MultisigWallet.new([owner0, owner1, owner2], 2);
      const owners = await wallet.getOwners();
      owners[0].should.be.equal(owner0);
      owners[1].should.be.equal(owner1);
      owners[2].should.be.equal(owner2);
      (await wallet.getRequiredSigs()).should.be.bignumber.equal("2");
    });

    it("should allow to submit transaction", async () => {
      const wallet = await MultisigWallet.new([owner0, owner1, owner2], 2);
      const txResult = await wallet.submitTransaction(notOwner, w3utils.toWei('1', 'ether'), '0x0').should.be.fulfilled;

      const transactionId = txResult.logs[0].args['transactionId'];
      transactionId.should.be.bignumber.equal("0");

      const result = await wallet.getTransactionById(transactionId);
      result['receiver'].should.be.equal(notOwner);
    });

    it("should execute transaction when it has enough confirmations", async () => {
      const wallet = await MultisigWallet.new([owner0, owner1, owner2], 2);
      const txResult = await wallet.submitTransaction(notOwner, w3utils.toWei('1', 'ether'), '0x0', {value: w3utils.toWei('1', 'ether')}).should.be.fulfilled;
      const transactionId = txResult.logs[0].args['transactionId'];

      const result2 = await wallet.confirmTransaction(transactionId, {from: owner1}).should.be.fulfilled;
      result2.logs[0].event.should.be.equal("Execution");
    });

    it("shouldn't execute transaction twice", async () => {
      const wallet = await MultisigWallet.new([owner0, owner1, owner2], 2);
      const txResult = await wallet.submitTransaction(notOwner, w3utils.toWei('1', 'ether'), '0x0', {value: w3utils.toWei('2', 'ether')}).should.be.fulfilled;
      const transactionId = txResult.logs[0].args['transactionId'];

      const result2 = await wallet.confirmTransaction(transactionId, {from: owner1}).should.be.fulfilled;
      result2.logs[0].event.should.be.equal("Execution");
      await expectRevert(wallet.confirmTransaction(transactionId, {from: owner1}));
    });

    it("should transfer erc20 tokens when confirmed", async () => {
      const wallet = await MultisigWallet.new([owner0, owner1, owner2], 2);
      const token = await TestToken.new(w3utils.toWei('100', 'ether'));
      await token.transfer(wallet.address, w3utils.toWei('1', 'ether'));

      const bytecode = token.contract.methods.transfer(notOwner, w3utils.toWei('1', 'ether')).encodeABI();

      const txResult = await wallet.submitTransaction(token.address, '0', bytecode).should.be.fulfilled;
      const transactionId = txResult.logs[0].args['transactionId'];
      await wallet.confirmTransaction(transactionId, {from: owner1}).should.be.fulfilled;
      (await token.balanceOf.call(notOwner)).should.be.bignumber.equal(w3utils.toWei('1', 'ether'));
    });
  });

});