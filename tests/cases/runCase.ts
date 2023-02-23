import path from "path";
import fs from 'fs';
import { execute, TestCase } from "./TestCase";
import Participants from "../../src/classes/Participants";
import request from "../../src/services/request.service";
import broadcast from "../../src/services/broadcast.service";
import { assert } from "console";
import IProof from "../../src/interfaces/IProof";

const Green = "\x1b[32m";
const Red = "\x1b[31m"
const Reset = "\x1b[0m";

const runCase = (async (options: {
  configFolder: string, 
  caseDir: string, 
  mnemonic: string, 
  traces: {
    toGenerate: number,
    nrTasks: number,
    nrParticipants: number,
    endEvent: number
  },
  participants: Participants
  }) => {

  let ganacheInstance;

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

    let traces: number[][][];
    if (options.traces.toGenerate > 0) {
      // generate new traces
      console.log("\nGenerate new traces...");
      const conforming = JSON.parse(fs.readFileSync(path.join(options.caseDir, '../traces/traces.json')).toString());
      traces = TestCase.generateTraces(
        conforming, 
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

    // replay traces
    let caught = 0;
    for (const trace of traces) {

      // wait for node to be ready
      console.log("\nCheck if node instances are ready...");
      const ready = await TestCase.isNodeReady([...participants.values()]);

      if (ready) {
        console.log("Node instances are ready...");
      } else {
        throw new Error("Node did not boot up...");
      }

      console.log("\nReplay trace...");
      let conforming = 0;
      for (const task of trace) {
        const parID = task[0];
        const taskID = task[1];
        // replay task
        console.log('\nReplay initiator', parID, 'trying to enact task', taskID);
        try {
          await request(participants.get(parID)!, "GET", "/enact/" + taskID);
          console.log("OK!");
          conforming++;
        } catch (error) {
          if (error instanceof Error 
            && error.name === "500" && error.message.includes("failed verification")) {
              console.log(error.message);
              break;
          }
          throw error;
        }
      }

      // check process state of all
      console.log("\nCheck process state...");
      const answers = new Array<IProof>;
      (await Promise.all(broadcast(
        request, 
        [...options.participants.values()], 
        "", 
        "GET", 
        "/case/0"
      )))
      .forEach((ans) => {
        let proof: IProof;
        try {
          proof = JSON.parse(ans).message;
        } catch (err) {
          throw err;
        }
        if (proof.newTokenState == null) {
          throw new Error(`Malformed JSON: ${ans} (2)`);
        }
        // collect answers
        answers.push(proof);
      });

      // all process states must match
      let stable: boolean = false;
      let rejected: boolean = false;
      if (!answers.every((p) => JSON.stringify(p) === JSON.stringify(answers[0]))) {
        assert(false, Red + "Process in unstable state!" + Reset);
        console.error(answers);
      } else {
        console.log(Green, "OK!", "Process is in a stable state", Reset);
        stable = true;
      }

      // end event can't be reached
      if (answers[0].newTokenState === options.traces.endEvent) {
        assert(false, Red + "Non-conforming trace not caught!" + Reset);
      } else {
        console.log(Green, "OK!", "Non-conforming trace caught", Reset);
        rejected = true;
      }

      if (stable && rejected) {
        caught++;
      }

      // redeploy to start fresh case
      console.log("\nRe-deploy and re-attach contract...");
      const res = execute( `npm run deploy` )!;
      const address = res
      .substring(
        res.indexOf("[") + 1, 
        res.lastIndexOf("]")
      );
      await Promise.all(broadcast(
        request, 
        [...options.participants.values()], 
        "", 
        "PUT", 
        "/attach/" + address
      ));
    }

    console.log("\nAll traces replayed...");
    console.log(caught, "non-conforming traces rejected of", traces.length);

    if (caught === traces.length) {
      console.log(Green, "All traces caught!", Reset);
    } else {
      console.log(Red, "Non-conforming traces missed!", Reset);
    }

  } catch(error) {
      console.log(Red, error, Reset);

  } finally {
    // stopping
    if (ganacheInstance) {
      console.log("Stopping ganache...");
      execute( `npx ganache instances stop ${ganacheInstance}` );
    }

    console.log("Stopping and cleaning up docker...");
    execute( `docker compose down` );
    execute( `docker compose rm -f` );
    //execute( `docker rmi $(docker compose images -q)` );

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

export default runCase;