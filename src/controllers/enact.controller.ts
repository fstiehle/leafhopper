import { Request, Response, NextFunction} from 'express';
import IRequestServer from '../interfaces/IRequestServer';
import ICase from '../interfaces/ICase';
import IWallet from '../interfaces/IWallet';
import Enforcement from '../services/enforcement.service';
import ProposeMessage from '../classes/ProposeMessage';
import ConfirmMessage from '../classes/ConfirmMessage';
import Step from '../classes/Step';
import broadcast from '../services/broadcast.service';

/**
 * 
 * @param process 
 * @param enforcement 
 * @param requestServer 
 * @returns 
 */
const enactController = (
  processCase: ICase, 
  wallet: IWallet,
  requestServer: IRequestServer) => {

  return async (req: Request, res: Response, next: NextFunction) => {
    // incoming message from local BPMS
    const taskID = parseInt(req.params.id);
    console.log('enact task ID', taskID);
    
    // Check blockchain for possible dispute state
    if (await wallet.isDisputed()) {
      return next(new Error(`Process Channel is disputed.`));
    }
    // Propose enactment to all other nodes, collect OKs (via /propose/)  
    const proposeMessage = new ProposeMessage();
    proposeMessage.from = wallet.identity;
    proposeMessage.step = new Step({
      index: processCase.steps.length,
      from: wallet.identity,
      caseID: processCase.caseID,
      taskID: taskID,
      newTokenState: Enforcement.enact(
        processCase.tokenState, taskID, wallet.identity)
    });
    proposeMessage.signature = await wallet.produceSignature(proposeMessage);

    // Broadcast 
    const otherParticipants = [...processCase.participants.values()]
    .filter(e => e.id !== wallet.identity);

    // Wait and collect confirmations of all participants
    Promise.all(broadcast(
      requestServer, 
      otherParticipants, 
      proposeMessage, 
      "POST", 
      "/propose/" + proposeMessage.step.taskID
    ))
    .then(async results => {

      const confirmation = new ConfirmMessage();
      confirmation.signatures[wallet.identity] = proposeMessage.signature;
      confirmation.step = proposeMessage.step;

      results.forEach((result) => {
        const receivedAnswer = new ProposeMessage();
        try {
          receivedAnswer.copyFromJSON(JSON.parse(result).message);
        } catch (err) {
          console.warn(err);
          throw new Error(`Malformed JSON: ${result} (1)`);
        }
        if (receivedAnswer.step == null || receivedAnswer.from == null || receivedAnswer.signature == null) {
          throw new Error(`Malformed JSON: ${result} (2)`);
        }
        confirmation.signatures[receivedAnswer.from] = receivedAnswer.signature;
        console.log('Proposal confirmed by', receivedAnswer.from);
      });

      if (!Enforcement.checkConfirmed(processCase, wallet, confirmation)) {
        throw new Error(`Proposal for ${confirmation.step!.taskID} failed: confirmation(s) missing.`);
      }
      console.log("Checks passed for", confirmation.step!.taskID);

      // Send all OKs to others (via /confirm/)
      // TODO: Could be done async
      await Promise.all(broadcast(
        requestServer, 
        otherParticipants, 
        confirmation, 
        "POST", 
        "/confirm/" + confirmation.step!.taskID
      ))
      .catch(e => console.error(e));

      // responds to local BPMS with OK 
      processCase.steps.push(confirmation.getProof());
      processCase.tokenState = confirmation.step!.newTokenState;
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify({message: confirmation}));
      return next();
    })
    .catch(error => {
      return next(error);
    });
  }
}

export default enactController;