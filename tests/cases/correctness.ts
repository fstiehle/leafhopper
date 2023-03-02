import path from "path";
import fs from 'fs';
import { execute, TestCase } from "./TestCase";
import Participants from "../../src/classes/Participants";
import request from "../../src/services/request.service";
import broadcast from "../../src/services/broadcast.service";
import { assert } from "console";

const Green = "\x1b[32m";
const Red = "\x1b[31m"
const Reset = "\x1b[0m";

const runCorrectnessCheck = (async (options: {
  configFolder: string, 
  caseDir: string, 
  mnemonic: string, 
  traces: {
    toGenerate: number,
    nrTasks: number,
    nrParticipants: number
  },
  participants: Participants
  }) => {

  let ganacheInstance: string|null = null;

  // backup config files in root folder
  TestCase.backupConfigFolder(options.configFolder);

  // copy config files from this case
  TestCase.copyConfigFiles(options.caseDir, options.configFolder);

  // amend participants info for localhost
  const participants = options.participants;
  participants.forEach((e) => {
    e.hostname = 'localhost';
    e.port = e.port + e.id;
  })

  try {
    // generate
    execute( `npm run generate ${path.join("./src/config/model/case.bpmn")}` );

    // deploy
    console.log("Booting up ganache...");
    try {
      ganacheInstance = execute( `npx ganache -m "${options.mnemonic}" -D` );
    } catch (error) {
      //  ganache may be already running, so we don't need this to succeed
      console.log(error);
    }

    execute( `npm run deploy` );

    // run docker in host mode
    console.log("Composing up docker...");
    execute( `docker compose up -d` );

    const conformingTraces: number[][][] = JSON.parse(fs.readFileSync(path.join(options.caseDir, '../traces/traces.json')).toString()).conforming;

    let traces: number[][][];
    if (options.traces.toGenerate > 0) {
      // generate new traces
      console.log("\nGenerate new traces...");
      traces = TestCase.generateTraces(
        conformingTraces, 
        options.traces.nrParticipants, 
        options.traces.nrTasks, 
        options.traces.toGenerate);

      fs.writeFile(path.join(options.caseDir, '../traces/generated.json'), JSON.stringify(traces), { flag: 'w+' },
          (err) => { if (err) { console.error(err); } });
          console.log("Contract address written to dist/config/leafhopper.config.js");

    } else {
      // read existing traces
      traces = JSON.parse(fs.readFileSync(path.join(options.caseDir, '../traces/generated.json')).toString());
    }

     // wait for node to be ready
     console.log("\nCheck if node instances are ready...");
     const ready = await TestCase.isNodeReady([...participants.values()]);

    if (ready) {
      console.log("Node instances are ready...");
    } else {
      throw new Error("Node did not boot up...");
    }

    // replay conforming traces
    let conforming = 0;
    for (const trace of conformingTraces) {
      console.log("\nReplay conforming trace...");
      for (const task of trace) {
        const par = participants.get(task[0])!;
        const taskID = task[1];
        const cond = task[2];
        // replay task
        console.log('\nReplay initiator', par.id, 'trying to enact task', taskID, 'with cond', cond);
        if (await TestCase.replayTask(par, cond, taskID)) {
          console.log("OK!")
        } else {
          assert(false, Red + "Conforming task rejected" + Reset);
          break;
        }
      }

      // check process state of all
      console.log("\nCheck process state...");
      const state = await TestCase.checkProcessState([...participants.values()], 0);
      if (!state.stable) {
        assert(false, Red + "Process in unstable state!" + Reset);
      } else {
        if (state.endReached) {
          console.log(Green, "OK!", "Process reached end event", Reset);
          conforming++;
        } else {
          assert(false, Red + "Conforming trace rejected" + Reset);
        }
      }

      // redeploy to start fresh case
      console.log("\nRe-deploy and re-attach contract...");
      const [_, address] = TestCase.redeploy();
      await Promise.all(broadcast(
        request, 
        [...options.participants.values()], 
        "", 
        "PUT", 
        "/attach/" + address
      ));
    }

    // replay non-conforming traces
    let caught = 0;
    for (const trace of traces) {      

      console.log("\nReplay non-conforming trace...");
      for (const task of trace) {
        const par = participants.get(task[0])!;
        const taskID = task[1];
        const cond = task[2];
        // replay task
        console.log('\nReplay initiator', par.id, 'trying to enact task', taskID, 'with cond', cond);
         if (await TestCase.replayTask(par, cond, taskID)) {
          console.log("OK!")
        } else {
          break;
        }
      }

      // check process state of all
      console.log("\nCheck process state...");
      const state = await TestCase.checkProcessState([...participants.values()], 0);
      if (!state.stable) {
        assert(false, Red + "Process in unstable state!" + Reset);
      } else {
        if (state.endReached) {
          assert(false, Red + "Non-conforming trace not caught!" + Reset);
        } else {
          console.log(Green, "OK!", "Non-conforming trace caught", Reset);
          caught++;
        }
      }

      // redeploy to start fresh case
      console.log("\nRe-deploy and re-attach contract...");
      const [_, address] = TestCase.redeploy();
      await Promise.all(broadcast(
        request, 
        [...options.participants.values()], 
        "", 
        "PUT", 
        "/attach/" + address
      ));
    }

    // communicate result
    console.log("\n\nAll traces replayed...");
    console.log(caught, "non-conforming traces rejected of", traces.length);
    console.log(conforming, "conforming traces accepted of", conformingTraces.length);

    if (conforming === conformingTraces.length) {
      console.log(Green, "All conforming traces accepted!", Reset);
    } else {
      console.log(Red, "Conforming traces rejected!", Reset);
    }

    if (caught === traces.length) {
      console.log(Green, "All non-conforming traces caught!", Reset);
    } else {
      console.log(Red, "Non-conforming traces missed!", Reset);
    }

    console.log("\nAll done!");

  } catch(error) {
      console.log(Red, error, Reset);

  } finally {
    // stopping
    if (ganacheInstance != null) {
      console.log("Stopping ganache...");
      execute( `npx ganache instances stop ${ganacheInstance}` );
    }

    console.log("Stopping and cleaning up docker...");
    execute( `docker compose down` );
    execute( `docker compose rm -f` );
    execute( `docker rmi $(docker compose images -q)` );

    // restore
    console.log("Restore and clean up...");
    TestCase.restoreConfigFolder(options.configFolder);
    // clean up
    TestCase.cleanUpConfigFiles(options.configFolder);
    execute( `npm run clean` );
    // re-generate from old config
    execute( `npm run generate` );
  }

  console.log("Done!");

});

export default runCorrectnessCheck;