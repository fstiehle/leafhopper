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

    const proposal = new ProposeMessage ();
    try {
      proposal.copyFromJSON(req.body.message);
    } catch (err) {
      return next(new Error(`Malformed JSON: ${JSON.stringify(req.body)}`));
    }

    if (!proposal.step || !proposal.signature) {
      return next(new Error(`Malformed JSON: ${JSON.stringify(req.body)}`));
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