import config from './config/leafhopper.config'
import express from 'express'
import checkConformance from './services/enforcement.service';
import request from './services/request.service';
import routes from './config/routes.config';
import Enforcement from './services/enforcement.service';
import Process from './classes/Process';
// This runs the state channel node, it reads its configuration from the config file.
// Set up Wallet
// const wallet = ethers.Wallet.fromMnemonic(leafhopper.mnemonic);

// Set the appropriate provider(s) for the Oracle
//const providers = getProvidersFromConfig(leafhopper.contract);
// Get routing information of other participants (URL, port, etc...)
//const participants = getParticipantsRoutingFromConfig(leafhopper.participants);
//const addresses = getParticipantsAddressFromConfig(leafhopper.participants);
// Set own identity
//const me = Number.parseInt(leafhopper.identity);

process.env.ROOT_CA = ""; // TODO

class Server {
  static listen () {
    const app = express();
    app.listen(config.PORT);
    routes(
      app, 
      new Process(),
      new Enforcement(),
      request
    )
    console.log(`Participant running on ${config.PORT} ⚡`);
  }
}

Server.listen();