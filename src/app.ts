// This runs the state channel node, it reads its configuration from the config file.
import config from './config/leafhopper.config'
import { ethers } from 'ethers';
import participantsConfig from './config/participants.config';
import { _Wallet } from './interfaces/IWallet';
import AppServer from './classes/AppServer';

let skey, id, port;
// load ID, port, and skey from ENV when present
if (process.env.ID && process.env.SKEY && process.env.PORT) {
  skey = process.env.SKEY;
  id = Number.parseInt(process.env.ID);
  port = Number.parseInt(process.env.PORT);
} else {
  skey = config.IDENTITY.skey;
  id = config.IDENTITY.ID;
  port = config.PORT;
}

console.log("Starting participant", id, "for case", config.CASE);

AppServer.listen(
  port, 
  id, 
  new ethers.Wallet(skey, new ethers.JsonRpcProvider(config.ROOT.chain)),
  config.ROOT.contract,
  participantsConfig);