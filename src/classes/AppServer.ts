import express from "express";
import routes from "../config/routes.config";
import Participants from "./Participants";
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
    const server = app.listen(port);
    // keep connections longer open, as we expect the same participants to connect to us frequently
    // also work around socket hang ups due to a too high agent keep alive timeout
    server.keepAliveTimeout = 25000; 
    return server;
  }
}