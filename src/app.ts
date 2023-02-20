// This runs the state channel node, it reads its configuration from the config file.
import config from './config/leafhopper.config'
import { ethers } from 'ethers';
import participantsConfig from './config/participants.config';
import { _Wallet } from './interfaces/IWallet';
import AppServer from './classes/AppServer';

console.log("Starting participant", config.IDENTITY.ID, "for case", config.CASE);

AppServer.listen(
  config.PORT, 
  config.IDENTITY.ID, 
  new ethers.Wallet(config.IDENTITY.skey, new ethers.JsonRpcProvider(config.ROOT.chain)),
  config.ROOT.contract,
  participantsConfig);