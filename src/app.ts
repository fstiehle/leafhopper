import config from './config/leafhopper.config'
import express from 'express'
import request from './services/request.service';
import routes from './config/routes.config';
import Enforcement from './services/enforcement.service';
import Process from './classes/Process';
import ethers from 'ethers';
import Wallet from './classes/Wallet';
// This runs the state channel node, it reads its configuration from the config file.
// Set up Wallet
// Set the appropriate provider(s) for the Wallet
//c onst providers = getProvidersFromConfig(leafhopper.contract);
// Get routing information of other participants (URL, port, etc...)
//const participants = getParticipantsRoutingFromConfig(leafhopper.participants);
//const addresses = getParticipantsAddressFromConfig(leafhopper.participants);

process.env.ROOT_CA = ""; // TODO

class Server {
  static listen () {
    const app = express();
    app.listen(config.PORT);
    routes(
      app,
      new Process(),
      new Enforcement(new Wallet(
        ethers.Wallet.fromPhrase(config.IDENTITY.mnemonic)
        // TODO: provider to communicate with blockchain
        )),
      request
    )
    console.log(`Participant running on ${config.PORT} ⚡`);
  }
}

Server.listen();