import path from "path";
import fs from 'fs';
import { execute, TestCase } from "./TestCase";
import Wallet from '../../src/classes/Wallet';
import config from '../../src/config/deployment.config';
import { ethers, JsonRpcProvider } from "ethers";
import { assert } from "console";
import ConfirmMessage from "../../src/classes/ConfirmMessage";
import IProof from "../../src/interfaces/IProof";

const logCost = (cost: Map<string, number>) => {
  cost.set("Total", [...cost.values()].reduce((p, e) => { return e + p }));
  // from: https://stackoverflow.com/a/2901298
  console.table(Array.from(cost).map(([key, value]) => [key.padStart(28), value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",").padStart(9)]));
}

const benchmarkCase = async (
  state: IProof, 
  provider: JsonRpcProvider, 
  participants: Wallet[],
  traces: number[][]) => {

  const gasCost = new Map<string, number>();
  const tx = await participants[0].submit(state);
  let total = Number.parseInt((await tx.wait(1)).gasUsed);
  gasCost.set("State Submission", total);
  if (await participants[0].isDisputed() !== true) {
    throw new Error("Contract dispute was not succeesful");
  }

  // mine a block so we move forward in time and elapse our dispute window
  await provider.send("evm_increaseTime", [1]);
  await provider.send("evm_mine", []);

  // continue on the blockchain
  console.log("\nReplay trace...");
  for (const task of traces) {
    const parID = task[0];
    const taskID = task[1];
    console.log("\nReplay task", taskID);
    // replay task to blockchain
    const wall = participants[parID];
    if (wall.contract == null) {
      throw Error("Partcipant " + parID + " Failed to connect to contract");
    }
    const tx = await wall.contract.continueAfterDispute(taskID);
    const cost = Number.parseInt((await tx.wait(1)).gasUsed);
    gasCost.set("Enact task " + taskID, cost);
    total += cost;
  }

  const end = await participants[0].contract!.tokenState();
  if (Number.parseInt(await participants[0].contract!.tokenState()) !== 0) {
    throw Error("End event not reached! Currently: " + end);
  } else {
    console.log("OK! End event reached");
  }

  gasCost.set("Total (Excluding Deployment)", total);
  return gasCost;
}

const runGasCost = (async (options: {
  configFolder: string, 
  caseDir: string, 
  mnemonic: string, 
  skeys: string[],
  traces: {
    toGenerate: number,
    nrTasks: number,
    nrParticipants: number,
    middleEvent: number
  }
  }) => {

  let ganacheInstance: string|null = null;

  // copy case
  // backup config files in root folder
  TestCase.backupConfigFolder(options.configFolder);

  // copy config files from this case
  TestCase.copyConfigFiles(options.caseDir, options.configFolder);

  // generate 
  try {
    // generate
    //execute( `npm run generate ${path.join("./src/config/model/case.bpmn")}` );

    // load traces
    const traces: any = JSON.parse(fs.readFileSync(path.join(options.caseDir, '../traces/traces.json')).toString());

    // start ganche
    console.log("Booting up ganache...");
    try {
      ganacheInstance = execute( `npx ganache -m "${options.mnemonic}" -D` );
    } catch (error) {
      //  ganache may be already running, so we don't need this to succeed
      console.log(error);
    }

    // deploy contract
    let [dCost, address] = TestCase.redeploy();

    const provider = new ethers.JsonRpcProvider(config.ROOT.chain);
    // prepare wallets
    const participants = new Array<Wallet>();
    options.skeys.forEach((key, i) => {
      participants.push(new Wallet(i, new ethers.Wallet(key, provider), address))
    });

    assert(await participants[0].isDisputed() === false, "Error: Contract is initially disputed!");

    let state: IProof;
    // best case: only submit final state
    console.log("Benchmark best case scenario: only submit final state");
    const final = new ConfirmMessage();
    final.step.newTokenState = 0;
    final.step.index = 1;
    for (let index = 0; index < participants.length; index++) {
      final.signatures.push(await participants[index].produceSignature(final.step));
    }
    state = final.getProof();
    let caseCost = await benchmarkCase(
      state, 
      provider,
      participants,
       []);

    caseCost.set("Deployment", dCost);
    logCost(caseCost);

    // re-deploy contract
    [dCost, address] = TestCase.redeploy();
    participants.forEach(async (w) => {
      await w.attach(address);
    });

    // average case: dispute with state after half of the process
    console.log("Benchmark average case scenario: dispute after half of the process");
    const half = new ConfirmMessage();
    half.step.newTokenState = options.traces.middleEvent;
    half.step.index = 1;
    for (let index = 0; index < participants.length; index++) {
      final.signatures.push(await participants[index].produceSignature(final.step));
    }
    state = final.getProof();
    const avgTrace = traces.conforming[traces.indexMediumCase];
    caseCost = await benchmarkCase(
      state, 
      provider, 
      participants,
      avgTrace.slice(Math.ceil(avgTrace.length / 2), avgTrace.length));

    caseCost.set("Deployment", dCost);
    logCost(caseCost);

    // re-deploy contract
    console.log("\nRe-deploy and re-attach contract...");
    [dCost, address] = TestCase.redeploy();
    participants.forEach(async (w) => {
      await w.attach(address);
    });

    // Worst Case: dispute at start of process
    console.log("Benchmark worst case scenario: stuck in start event");
    state = new ConfirmMessage().getProof();
    caseCost = await benchmarkCase(state, 
      provider, 
      participants, 
      traces.conforming[traces.indexWorstCase]);

    caseCost.set("Deployment", dCost);
    logCost(caseCost);
    
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
    //TestCase.restoreConfigFolder(options.configFolder);
    // clean up
    //TestCase.cleanUpConfigFiles(options.configFolder);
    //execute( `npm run clean` );
    // re-generate from old config
    //execute( `npm run generate` );
  }

});

export default runGasCost;