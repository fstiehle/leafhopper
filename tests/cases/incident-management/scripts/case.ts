import participants from "../config/participants.config";
import runCorrectnessCheck from "../../correctness";
import runGasCost from "../../gas-cost";

const CONFIG_FOLDER = __dirname + "../../../../../src/config";
const TEST_MNEMONIC = "decline fantasy twist absent spike life shoe split that brush dutch record"
const TO_GENERATE = 0;

let arg: null|string = null;
const args = process.argv.slice(2);
if (args.length > 0) {
  arg = args[0];
}

if (arg == null || (arg !== 'correctness' && arg !== 'gas')) {
  console.log('Either supply "gas" or "correctness" to perform benchmark.');
  console.log('- npm run case/# gas');
  console.log('- npm run case/# correctness');
}

if (arg === 'correctness') {
  runCorrectnessCheck({
    configFolder: CONFIG_FOLDER, 
    caseDir: __dirname, 
    mnemonic: TEST_MNEMONIC, 
    traces: {
      toGenerate: TO_GENERATE, 
      nrTasks: 9, 
      nrParticipants: 5,
    },
    participants
  });
} else if (arg === 'gas') {
  runGasCost({
    configFolder: CONFIG_FOLDER, 
    caseDir: __dirname, 
    mnemonic: TEST_MNEMONIC, 
    skeys: [
      "0xfaa4f01aaf33a7714276150ee56b66068eaeb1811918be248413be72b2c11206",
      "0x477161df8cac93ff134cc1512f666dd13838e6f343a054ec9378044090a7a264",
      "0x5cb22a0405bb77628da3b523af6941025419d726a21fef5951e84dc5fcf772db",
      "0xddc88739eccb6ad788d1ab2fe5dbe3a4b07b12669a8a57ad074767468e5f8772",
      "0xa3a84c5f2b96ae31e3334f8a67e11d23d21ac18432404d5c6cba58f6eccdbfa3"
    ],
    traces: {
      middleEvent: 32
    }
  });
}

