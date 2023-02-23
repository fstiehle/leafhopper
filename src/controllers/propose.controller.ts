import { Request, Response, NextFunction } from 'express';
import ICase from '../interfaces/ICase';
import IWallet from '../interfaces/IWallet';
import Enforcement from '../services/enforcement.service';
import ProposeMessage from '../classes/ProposeMessage';

const proposeController = (processCase: ICase, wallet: IWallet) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // incoming propose message
    const taskID = parseInt(req.params.id);
    console.log('received proposal for', taskID);

    // Check blockchain for possible dispute state
    if (await wallet.isDisputed()) {
      return next(new Error(`Process Channel is disputed.`));
    }

    const proposal = new ProposeMessage();
    try {
      proposal.copyFromJSON(req.body.message);
    } catch (err) {
      console.warn(err);
      return next(new Error(`Malformed JSON: ${req.body} (1)`));
    }

    if (proposal.step == null || proposal.signature == null) {
      return next(new Error(`Malformed JSON: ${req.body} (2)`));
    }

    if (proposal.step.taskID !== taskID) {
      return next(new Error(`Mismatched taskID: ${proposal.step.taskID} !== ${taskID}`));
    }

    if (proposal.step.from !== proposal.from) {
      return next(new Error(`Mismatched from: ${proposal.step.from} !== ${proposal.from}`));
    }

    // conformance check and respond with NAY or OK
    if (!Enforcement.check(processCase, wallet, proposal)) {
      return next(new Error(`Task ${taskID} failed verification`));
    }

    console.log('proposal ok for', taskID);
    const answer = new ProposeMessage(); 
    answer.step = proposal.step;
    answer.from = wallet.identity;
    answer.to = proposal.from;
    answer.signature = await wallet.produceSignature(answer);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify({message: answer}));
    return next();
  }
}
export default proposeController;