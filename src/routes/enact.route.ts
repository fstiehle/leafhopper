// incoming message from local BPMS
// Propose enactment to all other nodes, collect OKs
// Send async all OKs to others (via /confirm/), responds to local BPMS with OK 
import express, { Router } from 'express';
import IRequestServer from '../interfaces/IRequestServer';
import enactController from '../controllers/enact.controller';
import IWallet from '../interfaces/IWallet';
import ICase from '../interfaces/ICase';

const enactRoute = (process: ICase, wallet: IWallet, requestServer: IRequestServer): Router => {
  return express.Router().post('/:id([0-9]+)', enactController(process, wallet, requestServer));
}

export default enactRoute;