process.env.NODE_ENV = 'test';

import chai from 'chai';
import Step from '../../src/classes/Step';
import {ethers} from 'ethers';
import Wallet from '../../src/classes/Wallet';
import ProposeMessage from '../../src/classes/ProposeMessage';
const {expect} = chai;

describe('Test crypto functions', () => {

  it('test signing and verifying', async () => {
    const wallet = new Wallet(0, new ethers.Wallet(ethers.Wallet.createRandom().privateKey), "");

    const msg = new ProposeMessage();
    msg.step = new Step({
      index: 0,
      from: 0,
      caseID: 0,
      taskID: 0,
      newTokenState: []
    })

    let signature = await wallet.produceSignature(msg);
    expect(wallet.verify(msg, signature), "verify signature...").to.equal(wallet.address);

    msg.step.taskID = 1;
    expect(wallet.verify(msg, signature), "verify signature...").to.not.equal(wallet.address);

    const eve = new Wallet(0, new ethers.Wallet(ethers.Wallet.createRandom().privateKey), "");
    signature = await eve.produceSignature(msg);
    expect(wallet.verify(msg, signature), "verify signature...").to.not.equal(wallet.address);
  });

});