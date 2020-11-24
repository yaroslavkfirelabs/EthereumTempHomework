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
        throw null;
    }
    catch (error) {
        assert(error, "Expected an error but did not get one");
        const prefix = "Returned error: VM Exception while processing transaction: revert";
        assert(error.message.startsWith(prefix), "Expected an error starting with '" + prefix + "' but got '" + error.message + "' instead");
    }
};

const getSubmitEvent = tx => tx.logs.find(x => x.event == 'Submitted').args;
const getConfirmEvent = tx => tx.logs.find(x => x.event == 'Confirmed').args;
const getExecuteEvent = tx => tx.logs.find(x => x.event == 'Execution').args;
const getExecuteFailEvent = tx => tx.logs.find(x => x.event == 'ExecutionFailure').args;

const getSumbittedTransactionId = tx => getSubmitEvent(tx)['transactionId'];

contract('MultisigWallet', async ([owner0, owner1, owner2, notOwner]) => {
  describe('# MultisigWallet deployment', async () => {
    it ("should deploy multisig with correct owners", async () => {
      const wallet = await MultisigWallet.new([owner0, owner1, owner2], 2);

      const owners = await wallet.getOwners();
      owners.length.should.be.equal(3);
      owners[0].should.be.equal(owner0);
      owners[1].should.be.equal(owner1);
      owners[2].should.be.equal(owner2);
    });

    it ("should deploy multisig with correct required signatures", async () => {
      const wallet = await MultisigWallet.new([owner0, owner1, owner2], 2);

      (await wallet.getRequiredSigs()).should.be.bignumber.equal("2");
    });
  });

  describe('# MultisigWallet transaction submittion', async () => {
    it("should emit valid submit transaction event", async () => {
      const wallet = await MultisigWallet.new([owner0, owner1, owner2], 2);
      const txResult = await wallet.submitTransaction(notOwner, w3utils.toWei('1', 'ether'), '0x0').should.be.fulfilled;
      const event = getSubmitEvent(txResult);
      event.transactionId.should.be.bignumber.equal('0');
      event.submitter.should.be.equal(owner0);
    });

    it("should give submitted transactions sequential numbers", async () => {
      const wallet = await MultisigWallet.new([owner0, owner1, owner2], 2);

      for (let i = 0; i < 3; i++) {
        const txResult = await wallet.submitTransaction(notOwner, w3utils.toWei('1', 'ether'), '0x0').should.be.fulfilled;
        getSumbittedTransactionId(txResult).should.be.bignumber.equal(String(i));
      }
    });

    it("should save submitted transaction with given data", async () => {
      const wallet = await MultisigWallet.new([owner0, owner1, owner2], 2);
      const txResult = await wallet.submitTransaction(notOwner, w3utils.toWei('1', 'ether'), '0x0abc').should.be.fulfilled;
      const transactionId = getSumbittedTransactionId(txResult);

      const result = await wallet.getTransactionById(transactionId);
      result['receiver'].should.be.equal(notOwner);
      result['value'].should.be.bignumber.equal(w3utils.toWei('1', 'ether'));
      result['data'].should.be.equal('0x0abc');
      result['executed'].should.be.false;
    });

    it("shouldn't allow not owner to submit transaction", async () => {
      const wallet = await MultisigWallet.new([owner0, owner1, owner2], 2);
      await expectRevert(wallet.submitTransaction(owner0, w3utils.toWei('1', 'ether'), '0x0abc', {from: notOwner}));
    });

    it("should automatically confirm submitted transaction", async () => {
      const wallet = await MultisigWallet.new([owner0, owner1, owner2], 2);
      const txResult = await wallet.submitTransaction(owner0, w3utils.toWei('1', 'ether'), '0x0abc').should.be.fulfilled;

      const transactionId = getSumbittedTransactionId(txResult);
      const event = getConfirmEvent(txResult);
      event.transactionId.should.be.bignumber.equal(transactionId);
      event.confirmer.should.be.equal(owner0);
    });
  });

  describe('# MultisigWallet transaction confirmation', async () => {
    it("should emit valid confirm transaction event", async () => {
      const wallet = await MultisigWallet.new([owner0, owner1, owner2], 2);
      const txSubmit = await wallet.submitTransaction(notOwner, w3utils.toWei('1', 'ether'), '0x0').should.be.fulfilled;
      const transactionId = getSumbittedTransactionId(txSubmit);

      const tx = await wallet.confirmTransaction(transactionId, {from: owner1}).should.be.fulfilled;
      const event = getConfirmEvent(tx);
      event.transactionId.should.be.bignumber.equal(transactionId);
      event.confirmer.should.be.equal(owner1);
    });

    it("shouldn't allow not owner to confirm transactions", async () => {
      const wallet = await MultisigWallet.new([owner0, owner1, owner2], 2);
      const txSubmit = await wallet.submitTransaction(notOwner, w3utils.toWei('1', 'ether'), '0x0').should.be.fulfilled;
      const transactionId = getSumbittedTransactionId(txSubmit);

      await expectRevert(wallet.confirmTransaction(transactionId, {from: notOwner}));
    });

    it("shouldn't allow to confirm non-existent transactions", async () => {
      const wallet = await MultisigWallet.new([owner0, owner1, owner2], 2);

      await expectRevert(wallet.confirmTransaction('100', {from: notOwner}));
    });

    it("shouldn't allow to confirm transaction twice from same address", async () => {
      const wallet = await MultisigWallet.new([owner0, owner1, owner2], 2);
      const txSubmit = await wallet.submitTransaction(notOwner, w3utils.toWei('1', 'ether'), '0x0').should.be.fulfilled;
      const transactionId = getSumbittedTransactionId(txSubmit);

      await expectRevert(wallet.confirmTransaction(transactionId));
    });
  });

  describe('# MultisigWallet transaction execution', async () => {
    it("should emit valid execute event", async () => {
      const wallet = await MultisigWallet.new([owner0, owner1, owner2], 2);
      const txSubmit = await wallet.submitTransaction(notOwner, w3utils.toWei('1', 'ether'), '0x0', {value: w3utils.toWei('1', 'ether')}).should.be.fulfilled;
      const transactionId = getSumbittedTransactionId(txSubmit);

      const tx = await wallet.confirmTransaction(transactionId, {from: owner1}).should.be.fulfilled;
      const event = getExecuteEvent(tx);
      event.transactionId.should.be.bignumber.equal(transactionId);
    });

    it("shouldn't emit failed execute event", async () => {
      const wallet = await MultisigWallet.new([owner0, owner1, owner2], 2);
      const txSubmit = await wallet.submitTransaction(notOwner, w3utils.toWei('10000', 'ether'), '0x0', {value: w3utils.toWei('1', 'ether')}).should.be.fulfilled;
      const transactionId = getSumbittedTransactionId(txSubmit);

      const tx = await wallet.confirmTransaction(transactionId, {from: owner1}).should.be.fulfilled;
      const event = getExecuteFailEvent(tx);
      event.transactionId.should.be.bignumber.equal(transactionId);
    });

    it("shouldn't execute transaction twice", async () => {
      const wallet = await MultisigWallet.new([owner0, owner1, owner2], 2);
      const txSubmit = await wallet.submitTransaction(notOwner, w3utils.toWei('1', 'ether'), '0x0', {value: w3utils.toWei('1', 'ether')}).should.be.fulfilled;
      const transactionId = getSumbittedTransactionId(txSubmit);

      await wallet.confirmTransaction(transactionId, {from: owner1}).should.be.fulfilled;
      await expectRevert(wallet.confirmTransaction(transactionId, {from: owner2}));
    });

    it("should transfer ether when confirmed", async () => {
      const randomAddress = '0x66026026ee31c554e06579a85fa15e32363ad7df';
      const wallet = await MultisigWallet.new([owner0, owner1, owner2], 2);
      const txSubmit = await wallet.submitTransaction(randomAddress, w3utils.toWei('1', 'ether'), '0x0', {value: w3utils.toWei('1', 'ether')}).should.be.fulfilled;
      const transactionId = getSumbittedTransactionId(txSubmit);

      await wallet.confirmTransaction(transactionId, {from: owner1}).should.be.fulfilled;
      balance = await web3.eth.getBalance(randomAddress);
      balance.should.be.bignumber.equal(w3utils.toWei('1', 'ether'));
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