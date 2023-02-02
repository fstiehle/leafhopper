// incoming propose message
// conformance check and respond with NAY or OK
import express, { Router } from 'express';
import IEnforcement from '../interfaces/IEnforcement';
import IProcess from '../interfaces/IProcess';
import proposeController from '../controllers/propose.controller';

const proposeRoute = (process: IProcess, enforcement: IEnforcement): Router => {
  return express.Router().get('/:id([0-9]+)', proposeController(process, enforcement));
}

export default proposeRoute;