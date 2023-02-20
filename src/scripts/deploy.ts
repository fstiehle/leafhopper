import config from '../config/deployment.config';
import participants from '../config/participants.config';
import { ethers } from "ethers";
import fs from 'fs';

(async () => {

  const wallet = ethers.Wallet.fromPhrase(
    config.IDENTITY.mnemonic,
    new ethers.JsonRpcProvider(config.ROOT.chain));

  const metadata = JSON.parse(fs.readFileSync('./dist/contracts/ProcessChannel.json').toString());

  const keys: string[] = [];
  participants.forEach(p => keys.push(p.pubKey));

  // Deploy the contract
  const factory = ethers.ContractFactory.fromSolidity(metadata, wallet);
  const contract = await factory.deploy(keys, config.ROOT.disputeWindow);
  const address = await contract.getAddress();
  console.log(`Deployment successful! Contract address: ${address}`);

  const leafhopper = fs.readFileSync('./dist/config/leafhopper.config.js')
  .toString()
  .replace("{{{contractAddress}}}", address);

  fs.writeFile('./dist/config/leafhopper.config.js', leafhopper, { flag: 'w+' },
      (err) => { if (err) { console.error(err); } });
      console.log("Contract address written to leafhopper.config.js");

})();