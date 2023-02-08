// incoming confirm message
// check signatures (including my own)
// install as new state
import express, { Router } from 'express';
import confirmController from '../controllers/confirm.controller';
import ICase from '../interfaces/ICase';
import IWallet from '../interfaces/IWallet';

const confirmRoute = (process: ICase, wallet: IWallet): Router => {
  return express.Router().post('/:id([0-9]+)', confirmController(process, wallet));
}

export default confirmRoute;