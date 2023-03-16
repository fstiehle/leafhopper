import config from '../config/deployment.config';
import participants from '../config/participants.config';
import { ethers } from "ethers";
import fs from 'fs';

let filePath = './dist/contracts/ProcessChannel.json';
let baseline = false;
const args = process.argv.slice(2);
if (args.length > 0) {
 filePath = args[0];
 if (args[1]) {
  baseline = true;
 }
}

(async () => {

  const wallet = ethers.Wallet.fromMnemonic(
    config.IDENTITY.mnemonic).connect(new ethers.providers.JsonRpcProvider(config.ROOT.chain));

  const metadata = JSON.parse(fs.readFileSync(filePath).toString());

  const keys: string[] = [];
  participants.forEach(p => keys.push(p.pubKey));

  // Deploy the contract
  const factory = ethers.ContractFactory.fromSolidity(metadata, wallet);
  const contract = baseline ? await factory.deploy(keys) : await factory.deploy(keys, config.ROOT.disputeWindow);
  const address = contract.address;
  console.log(`Deployment of ${filePath} successful! Contract address:`);
  console.log(`[${address}]`);

  const tx = contract.deployTransaction;
  if (tx == null) {
    return console.error("Error getting deployment tx.");
  } 

  const receipt = await tx.wait(1);
  console.log(`Gas used: {${receipt?.gasUsed.toString()}}`);

  if (baseline)
    return;

  const leafhopper = fs.readFileSync('./dist/config/leafhopper.config.js')
  .toString()
  .replace("{{{contractAddress}}}", address);

  fs.writeFile('./dist/config/leafhopper.config.js', leafhopper, { flag: 'w+' },
      (err) => { if (err) { console.error(err); } });
      console.log("Contract address written to dist/config/leafhopper.config.js");

})();