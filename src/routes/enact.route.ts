// incoming message from local BPMS
// Propose enactment to all other nodes, collect OKs
// Send async all OKs to others (via /confirm/), responds to local BPMS with OK 
import express, { Router } from 'express';
import IRequestServer from '../interfaces/IRequestServer';
import enactController from '../controllers/enact.controller';
import IProcess from '../interfaces/IProcess';
import IEnforcement from '../interfaces/IEnforcement';

const enactRoute = (process: IProcess, enforcement: IEnforcement, requestServer: IRequestServer): Router => {
  return express.Router().post('/:id([0-9]+)', enactController(process, enforcement, requestServer));
}

export default enactRoute;