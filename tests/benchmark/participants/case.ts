import {expect, use} from 'chai';
import { execute } from "../../cases/TestCase";
import {deployContract, MockProvider, solidity} from 'ethereum-waffle';
import { Contract } from "ethers";
import fs from 'fs';
import Proof from "./Proof";
import path from 'path';
use(solidity);

(async () => {
  try {
    // compile contracts
    execute("npx waffle compile");

    // Mock provider
    let provider: MockProvider;
    // collect all cost
    const allCost: any = {};

    for (const nr of [1, 2, 4, 8, 10, 20, 100]) {
      console.log("prepare case for", nr, "participants");
      allCost[nr] = {};
      provider = new MockProvider({ganacheOptions: {"wallet": {"totalAccounts": nr}}})
      let participants = provider.getWallets();
      let addresses: string[] = [];
      participants.forEach(w => addresses.push(w.address));
      const abi = JSON.parse(fs.readFileSync(__dirname + '/build/ProcessChannel' + nr + '.json').toString());
      console.log("Deploy...");
      let contract = (await deployContract(
        participants[0], 
        abi, 
        [addresses, 5])
        );
      let channels = new Array<Contract>();
      participants.forEach(async (wallet) => {
        channels.push(contract.connect(wallet));
      });

      let tx, cost;
      console.log("Submit first dispute...");
      // Case 1: Dispute with stale state, then answer
      // First dispute
      const first = new Proof();
      first.index = 1;
      first.newTokenState = 2;
      await first.sign(participants);
      tx = await (await channels[0].submit(first)).wait(1);
      expect((await channels[0].index()).toNumber(), "Index not increased!").to.equal(1);
      cost = tx.gasUsed.toNumber();
      allCost[nr]['first'] = cost;

      // Second dispute
      console.log("Submit second dispute...");
      const second = new Proof();
      second.index = 2;
      second.newTokenState = 4;
      await second.sign(participants);
      tx = await (await channels[0].submit(second)).wait(1);
      expect((await channels[0].index()).toNumber(), "Index not increased!").to.equal(2);
      cost = tx.gasUsed.toNumber();
      allCost[nr]['second'] = cost;

      // Case 3: Submission of final state
      console.log("Redeploy...");
      contract = (await deployContract(
        participants[0], 
        abi, 
        [addresses, 5])
        );

      channels = new Array<Contract>();
      participants.forEach(async (wallet) => {
        channels.push(contract.connect(wallet));
      });

      console.log("Submit final dispute...");
      const final = new Proof();
      final.index = 1;
      final.newTokenState = 0;
      await final.sign(participants);
      tx = await (await channels[0].submit(final)).wait(1);
      expect((await channels[0].tokenState()).toNumber(), "End of process not reached!").to.equal(0);
      cost = tx.gasUsed.toNumber();
      allCost[nr]['final'] = cost;
    }

    console.table(allCost);

    console.log("\nAll Done! 😍");
    
  } catch (error) {
    console.log(error);

  }
})();