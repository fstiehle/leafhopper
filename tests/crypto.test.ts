process.env.NODE_ENV = 'test';

import chai from 'chai';
import Step from '../src/classes/Step';
import {ethers} from 'ethers';
import Wallet from '../src/classes/Wallet';
const {expect} = chai;

describe('Test crypto functions', () => {

  it('test signing and verifying', async () => {
    const wallet = new Wallet(ethers.Wallet.createRandom());

    const step = new Step({
      index: 0,
      from: 0,
      caseID: 0,
      taskID: 0,
      newTokenState: []
    })
    let signature = await wallet.signature(step);
    expect(wallet.address(step, step.signature[step.from]), "verify signature...").to.eql(wallet.address);

    step.taskID = 1;
    expect(wallet.address(step, step.signature[step.from]), "verify signature...").to.not.eql(wallet.address);

    const eve = new Wallet(ethers.Wallet.createRandom());
    signature = await eve.signature(step);
    expect(wallet.address(step, step.signature[step.from]), "verify signature...").to.not.eql(wallet.address);
  });

});