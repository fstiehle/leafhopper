import { Request, Response, NextFunction } from 'express';
import Enforcement from '../services/enforcement.service';
import ICase from '../interfaces/ICase';
import IWallet from '../interfaces/IWallet';
import ConfirmMessage from '../classes/ConfirmMessage';

const confirmController = (processCase: ICase, wallet: IWallet) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // incoming confirm message
    const taskID = parseInt(req.params.id);
    console.log('confirm request for', taskID);

    const confirmation = new ConfirmMessage();
    try {
      confirmation.copyFromJSON(req.body.message);
    } catch (err) {
      return next(new Error(`Malformed JSON: ${JSON.stringify(req.body)}`));
    }

    if (!confirmation.step || !confirmation.signature) {
      return next(new Error(`Malformed JSON: ${JSON.stringify(req.body)}`));
    }

    if (confirmation.step.taskID !== taskID) {
      return next(new Error(`Mismatched taskID: ${confirmation.step.taskID} !== ${taskID}`));
    }
    // check signatures (including my own)
    if (!Enforcement.checkConfirmed(processCase, wallet, confirmation)) {
      return next(new Error(`Task ${taskID} failed confirmation`));
    }
    // install as new state
    processCase.steps.push(confirmation.step);
    processCase.tokenState = confirmation.step.newTokenState;
    res.sendStatus(200);
    return next();
  }
}
export default confirmController;