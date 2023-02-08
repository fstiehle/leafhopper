import config from './config/generated/leafhopper.config'
import { ethers } from 'ethers';
import participantsConfig from './config/generated/participants.config';
import { _Wallet } from './interfaces/IWallet';
import AppServer from './classes/AppServer';
// This runs the state channel node, it reads its configuration from the config file.
// Set up Wallet
// Set the appropriate provider(s) for the Wallet
//c onst providers = getProvidersFromConfig(leafhopper.contract);
// Get routing information of other participants (URL, port, etc...)
//const participants = getParticipantsRoutingFromConfig(leafhopper.participants);
//const addresses = getParticipantsAddressFromConfig(leafhopper.participants);

AppServer.listen(
  config.PORT, 
  config.IDENTITY.ID, 
  ethers.Wallet.fromPhrase(config.IDENTITY.mnemonic), 
  participantsConfig);