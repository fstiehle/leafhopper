// incoming confirm message
// check signatures (including my own)
// install as new state
import express, { Router } from 'express';
import attachController from '../controllers/attach.controller';
import ICase from '../interfaces/ICase';
import IWallet from '../interfaces/IWallet';

const attachRoute = (process: ICase, wallet: IWallet): Router => {
  return express.Router().put('/:address(0[xX][0-9a-fA-F]+)', attachController(process, wallet));
}

export default attachRoute;