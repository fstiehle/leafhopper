// incoming propose message
// conformance check and respond with NAY or OK
import express, { Router } from 'express';
import proposeController from '../controllers/propose.controller';
import IWallet from '../interfaces/IWallet';
import ICase from '../interfaces/ICase';

const proposeRoute = (process: ICase, wallet: IWallet): Router => {
  return express.Router().post('/:id([0-9]+)', proposeController(process, wallet));
}

export default proposeRoute;