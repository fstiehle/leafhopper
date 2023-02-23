import { execSync } from "child_process";
import path from "path";
import Participants, { Participant } from "../../src/classes/Participants";
import IProof from "../../src/interfaces/IProof";
import broadcast from "../../src/services/broadcast.service";
import request from "../../src/services/request.service";

const Green = "\x1b[32m";
const Reset = "\x1b[0m";

const execute = (line: string): string|null => {
  console.log(line);
  const returned = execSync(line);
  if (returned != null) {
    console.log(Green, returned.toString(), Reset);
  }
  return returned.toString();
}

const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class TestCase {

  static async isNodeReady(participants: Participant[]) {
    for (let index = 0; index < 10; index++) {
      try {
        console.log(await Promise.all(broadcast(
          request, 
          participants, 
          "", 
          "GET", 
          "/"
        )));
        return true;
      } catch (error) {
        console.log("Not yet ready...");
        await sleep(500);
      }
    }
    await sleep(500);
    return false;
  }

  static async replayTask(par: Participant, taskID: number) {
      // replay task
      console.log('\nReplay initiator', par.id, 'trying to enact task', taskID);
      try {
        await request(par, "GET", "/enact/" + taskID);
        return true;
      } catch (error) {
        if (error instanceof Error 
          && error.name === "500" && error.message.includes("failed verification")) {
            console.log(error.message);
            return false;
        }
        throw error;
      }
  }

  static async checkProcessState(participants: Participant[], endEvent: number) {
      const answers = new Array<IProof>;
      (await Promise.all(broadcast(
        request, 
        participants, 
        "", 
        "GET", 
        "/case/0"
      )))
      .forEach((ans) => {
        const proof: IProof = JSON.parse(ans).message;
        if (proof.newTokenState == null) {
          throw new Error(`Malformed JSON: ${ans} (2)`);
        }
        // collect answers
        answers.push(proof);
      });

      // all process states must match
      let stable = false;
      let endReached = false;
      if (answers.every((p) => JSON.stringify(p) === JSON.stringify(answers[0]))) {
        stable = true;
      }

      if (answers[0].newTokenState === endEvent) {
        endReached = true;
      } else {
        endReached = false;
      }

      return { stable, endReached };
  }

  static generateTraces(
    conforming: number[][][], 
    nrParticipants: number, 
    nrTasks: number, 
    to_generate = 60) {
    
    const traces = new Array<number[][]>();

    let conformingNr = 0;
    for (let index = 0; index < to_generate; index++) {

      const operation = Math.floor(Math.random() * 3);
      const taskID = Math.floor(Math.random() * nrTasks);

      let generated = [...conforming[Math.floor(Math.random() * conforming.length)]];

      switch (operation) {
        case 0: {
          // add an event
          const initiator = Math.floor(Math.random() * nrParticipants);
          generated.splice(Math.floor(Math.random() * generated.length), 0, [initiator, taskID]);
          break;
        }
        case 1: {
          // remove an event
          generated = generated.filter(obj => obj[1] !== taskID);
          break;
        }
        case 2: {
          // switch the order of two events
          const index = Math.floor(Math.random() * (generated.length-1)) + 1;
          const tmp = generated[index-1];
          generated[index-1] = generated[index];
          generated[index] = tmp;
          break;
        }
      }
      
      if (conforming.some(t => JSON.stringify(t) === JSON.stringify(generated))) {
        conformingNr++;
      } else {
        traces.push(generated);
      }
    }
    console.log("Generated", to_generate - conformingNr, "traces; generated", conformingNr, "conforming traces, which were skipped.")
    return traces;
  }

  static backupConfigFolder(config_folder: string) {
    execute( `npx ncp ${path.join(config_folder, "/participants.config.ts")} ${path.join(config_folder, "/_participants.config.ts")}` );
    execute( `npx ncp ${path.join(config_folder, "/leafhopper.config.ts")} ${path.join(config_folder, "/_leafhopper.config.ts")}` );
  }

  static restoreConfigFolder(config_folder: string) {
    execute( `npx ncp ${path.join(config_folder, "/_participants.config.ts")} ${path.join(config_folder, "/participants.config.ts")}` );
    execute( `npx ncp ${path.join(config_folder, "/_leafhopper.config.ts")} ${path.join(config_folder, "/leafhopper.config.ts")}` );
  }

  static copyConfigFiles(dir: string, CONFIG_FOLDER: string) {
    for (const file of ['participants.config.ts', 'leafhopper.config.ts', 'model/case.bpmn'])
      execute( `npx ncp ${path.join(dir, "../config/", file)} ${path.join(CONFIG_FOLDER, file)}` );
    execute( `npx ncp ${path.join(dir, "../config/docker-compose.yml")} ${path.join("./docker-compose.yml")}` );
  }

  static cleanUpConfigFiles(CONFIG_FOLDER: string) {
    for (const file of ['_participants.config.ts', '_leafhopper.config.ts', 'model/case.bpmn'])
      execute( `npx rimraf ${path.join(CONFIG_FOLDER, file)}` );
    execute( `npx rimraf ${path.join("./docker-compose.yml")}` );
  }
}

export { execute, TestCase };