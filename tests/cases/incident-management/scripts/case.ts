import participants from "../config/participants.config";
import runCase from "../../runCase";

const CONFIG_FOLDER = __dirname + "../../../../../src/config";
const TEST_MNEMONIC = "decline fantasy twist absent spike life shoe split that brush dutch record"

runCase({
  configFolder: CONFIG_FOLDER, 
  caseDir: __dirname, 
  mnemonic: TEST_MNEMONIC, 
  traces: {
    toGenerate: 0, 
    nrTasks: 9, 
    nrParticipants: 5,
    endEvent: 128
  },
  participants});