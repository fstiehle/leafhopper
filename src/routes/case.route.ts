// incoming confirm message
// check signatures (including my own)
// install as new state
import express, { Router } from 'express';
import caseController from '../controllers/case.controller';
import ICase from '../interfaces/ICase';

const caseRoute = (process: ICase): Router => {
  return express.Router().get('/:case', caseController.get(process));
}

export default caseRoute;