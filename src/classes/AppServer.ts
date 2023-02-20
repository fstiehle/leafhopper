import express from "express";
import routes from "../config/routes.config";
import Participants from "../interfaces/IParticipants";
import { _Wallet } from "../interfaces/IWallet";
import request from "../services/request.service";
import Case from "./Case";
import Wallet from "./Wallet";

export default class AppServer {
  static listen(
    port: number,
    identity: number,
    wallet: _Wallet,
    contractAddress: string,
    participants: Participants
   ) {
    const app = express();
    routes(
      app,
      new Case(participants),
      new Wallet(identity, wallet, contractAddress),
      request
    )
    console.log(`Participant ${identity} running on ${port} ⚡`);
    return app.listen(port);
  }
}