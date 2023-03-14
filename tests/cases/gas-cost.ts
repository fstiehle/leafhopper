import path from "path";
import fs from 'fs';
import { execute, TestCase } from "./TestCase";
import Wallet from '../../src/classes/Wallet';
import config from '../../src/config/deployment.config';
import { ethers, JsonRpcProvider } from "ethers";
import ConfirmMessage from "../../src/classes/ConfirmMessage";
import IProof from "../../src/interfaces/IProof";

const logCost = (cost: Map<string, number>, title: string) => {
  console.log(title);
  const deployment = cost.get("Deployment"); cost.delete("Deployment");
  cost.set("Total (without Deployment)", [...cost.values()].reduce((p, e) => { return e + p }));
  cost.set("Deployment", deployment ? deployment : 0);
  cost.set("Total", cost.get("Total (without Deployment)")! + (deployment ? deployment : 0));
  // from: https://stackoverflow.com/a/2901298
  console.table(Array.from(cost).map(([key, value]) => [key.padStart(28), value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",").padStart(9)]));
}

const benchmarkCase = async (
  states: IProof[], 
  provider: JsonRpcProvider, 
  participants: Wallet[],
  traces: number[][]) => {

  if (await participants[0].isDisputed() === true) {
    throw new Error("Contract already disputed!");
  }

  const gasCost = new Map<string, number>();
  for (const state of states) {
    const tx = await participants[0].submit(state);
    const cost = Number.parseInt((await tx.wait(1)).gasUsed);
    gasCost.set("State Submission " + state.index, cost);
    if (await participants[0].index() !== state.index) {
      throw new Error("Contract submit was not succeesful");
    }
  }

  // mine a block so we move forward in time and elapse our dispute window
  await provider.send("evm_increaseTime", [10]);
  await provider.send("evm_mine", []);

  // continue on the blockchain
  console.log("\nReplay trace...");
  for (const task of traces) {
    const parID = task[0];
    const taskID = task[1];
    const cond = task[2];
    console.log("\nReplay task", taskID);
    // replay task to blockchain
    const wall = participants[parID];
    if (wall.contract == null) {
      throw Error("Partcipant " + parID + " Failed to connect to contract");
    }
    const tx = await wall.contract.continueAfterDispute(taskID, cond);
    const cost = Number.parseInt((await tx.wait(1)).gasUsed);
    gasCost.set("Enact task " + taskID, cost);
  }

  const end = await participants[0].contract!.tokenState();
  if (Number.parseInt(await participants[0].contract!.tokenState()) !== 0) {
    throw Error("End event not reached! Currently: " + end);
  } else {
    console.log("OK! End event reached");
  }

  return gasCost;
}

const runGasCost = (async (options: {
  configFolder: string, 
  caseDir: string, 
  mnemonic: string, 
  skeys: string[],
  steps: {
    averageCase: {newTokenState: number}[],
    worstCase: {newTokenState: number}[][]
  }}) => {

  let ganacheInstance: string|null = null;

  // copy case
  // backup config files in root folder
  TestCase.backupConfigFolder(options.configFolder);

  // copy config files from this case
  TestCase.copyConfigFiles(options.caseDir, options.configFolder);

  // generate 
  try {
    // generate
    execute( `npm run generate ${path.join("./src/config/model/case.bpmn")} baseline` );

    // load traces
    const traces: any = JSON.parse(fs.readFileSync(path.join(options.caseDir, './traces/traces.json')).toString());

    // start ganche
    console.log("Booting up ganache...");
    try {
      ganacheInstance = execute( `npx ganache -m "${options.mnemonic}" -D` );
    } catch (error) {
      //  ganache may be already running, so we don't need this to succeed
      console.log(error);
    }

    const provider = new ethers.JsonRpcProvider(config.ROOT.chain);
    // prepare wallets
    const participants = new Array<Wallet>();
    options.skeys.forEach((key, i) => {
      participants.push(new Wallet(i, new ethers.Wallet(key, provider), ""))
    });

    // ------------------------------
    // Baseline: Benchmark Baseline
    console.log("\nBenchmark baseline");
    for (const [traceID, trace] of traces.conforming.entries()) {
      const gasCost = new Map<string, number>();
      const [dCost, address] = TestCase.redeploy(true);
      gasCost.set("Deployment", dCost);
      participants.forEach(async (w) => {
        await w.attach(address, './dist/contracts/ProcessEnactment.json');
      });

      for (const task of trace) {
        const parID = task[0];
        const taskID = task[1];
        const cond = task[2];
        // replay task
        console.log('\nReplay initiator', parID, 'trying to enact task', taskID, 'with cond', cond);
        const tx = await (await participants[parID].contract!.enact(taskID, cond)).wait(1);
        const cost = Number.parseInt(tx.gasUsed)
        gasCost.set(`enact task ${taskID}`, cost);
      }
      logCost(gasCost, "Baseline Case Trace " + traceID);
    }

    for (const [traceID, trace] of traces.conforming.entries()) {
      console.log("Replay Trace", traceID);

      let [dCost, address] = TestCase.redeploy();
      participants.forEach(async (w) => {
        await w.attach(address);
      });

      // ------------------------------
      // Best Case: only submit final state
      console.log("\nBenchmark best case scenario: only submit final state");
      const final = new ConfirmMessage();
      final.step.newTokenState = 0;
      final.step.index = 1;
      for (let index = 0; index < participants.length; index++) {
        final.signatures.push(await participants[index].produceSignature(final.step));
      }
      let caseCost = await benchmarkCase(
        [final.getProof()], 
        provider,
        participants,
        []);

      caseCost.set("Deployment", dCost);
      logCost(caseCost, "Best Case Trace " + traceID);

      // re-deploy contract
      [dCost, address] = TestCase.redeploy();
      participants.forEach(async (w) => {
        await w.attach(address);
      });

      // ------------------------------
      // Average Case: dispute with state after half of the process
      console.log("\nBenchmark average case scenario: dispute after half of the process");
      
      const proof = new ConfirmMessage();
      proof.step.newTokenState = options.steps.averageCase[traceID].newTokenState;
      proof.step.index = 1;
      for (let index = 0; index < participants.length; index++)
        proof.signatures.push(await participants[index].produceSignature(proof.step));

      caseCost = await benchmarkCase(
        [proof.getProof()], 
        provider, 
        participants,
        trace.slice(Math.ceil(trace.length / 2), trace.length));

      caseCost.set("Deployment", dCost);
      logCost(caseCost, "Avg. Case Trace " + traceID);

      // re-deploy contract
      console.log("\nRe-deploy and re-attach contract...");
      [dCost, address] = TestCase.redeploy();
      participants.forEach(async (w) => {
        await w.attach(address);
      });

      // ------------------------------
      // Worst Case: dispute after first task of process with stale state
      console.log("\nBenchmark worst case scenario: submission of stale state");
      const proofs = new Array<IProof>();
      for (const [j, step] of options.steps.worstCase[traceID].entries()) {
        const proof = new ConfirmMessage();
        proof.step.newTokenState = step.newTokenState;
        proof.step.index = j + 1;
        for (let index = 0; index < participants.length; index++)
          proof.signatures.push(await participants[index].produceSignature(proof.step));

        proofs.push(proof.getProof());
      }

      caseCost = await benchmarkCase(
        proofs, 
        provider, 
        participants, 
        trace.slice(2, trace.length));

      caseCost.set("Deployment", dCost);
      logCost(caseCost, "Worst Case Trace " + traceID);
    }

    console.log("\nAll done!");

  } catch(err) {
    console.error(err);

  } finally {
    // stop ganche
    if (ganacheInstance != null) {
      console.log("Stopping ganache...");
      execute( `npx ganache instances stop ${ganacheInstance}` );
    }
    // clean up case
    console.log("Restore and clean up...");
    TestCase.restoreConfigFolder(options.configFolder);
    // clean up
    TestCase.cleanUpConfigFiles(options.configFolder);
    execute( `npm run clean` );
    // re-generate from old config
    execute( `npm run generate` );
  }

});

export default runGasCost;