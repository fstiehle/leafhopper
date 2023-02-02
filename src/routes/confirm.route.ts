// incoming confirm message
// check signatures (including my own)
// install as new state
import express, { Router } from 'express';
import confirmController from '../controllers/confirm.controller';
import IEnforcement from '../interfaces/IEnforcement';
import IProcess from '../interfaces/IProcess';

const confirmRoute = (process: IProcess, enforcement: IEnforcement): Router => {
  return express.Router().post('/:id([0-9]+)', confirmController(process, enforcement));
}

export default confirmRoute;