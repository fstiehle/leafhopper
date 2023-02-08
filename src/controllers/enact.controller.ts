import { Request, Response, NextFunction} from 'express';
import IRequestServer from '../interfaces/IRequestServer';
import ICase from '../interfaces/ICase';
import { Participant } from '../interfaces/IParticipants';
import IWallet from '../interfaces/IWallet';
import Enforcement from '../services/enforcement.service';
import ProposeMessage from '../classes/ProposeMessage';
import ConfirmMessage from '../classes/ConfirmMessage';
import IMessage from '../interfaces/IMessage';
import Step from '../classes/Step';

/**
 * 
 * @param requestServer 
 * @param step 
 * @param method 
 * @param path 
 * @returns 
 */
const broadcast = (
  requestServer: IRequestServer, 
  participants: Participant[],
  message: IMessage, 
  method: string, 
  path: string) => {

  const broadcast = new Array<Promise<any>>();
  for (const participant of participants) {
    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
      hostname: participant.hostname,
      port: participant.port
    }
    broadcast.push(requestServer(
      options,
      method,
      path,
      JSON.stringify({message})
    ));
  }
  return broadcast;
}

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
    // TODO: Check blockchain for possible dispute state
    // Propose enactment to all other nodes, collect OKs (via /propose/)  
    const proposeMessage = new ProposeMessage();
    proposeMessage.from = wallet.identity;
    proposeMessage.step = new Step({
      index: processCase.steps.length,
      from: wallet.identity,
      caseID: processCase.caseID,
      taskID: taskID,
      newTokenState: Enforcement.enact(
        [...processCase.tokenState], taskID, wallet.identity)
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
    .then(results => {

      const confirmation = new ConfirmMessage();
      confirmation.signature[wallet.identity] = proposeMessage.signature;
      confirmation.step = proposeMessage.step;

      results.forEach((result) => {
        const receivedAnswer  = new ProposeMessage();
        try {
          receivedAnswer.copyFromJSON(JSON.parse(result).message);
        } catch (err) {
          return next(new Error(`Malformed JSON: ${JSON.stringify(result)}`));
        }

        if (!receivedAnswer.step || !receivedAnswer.from || !receivedAnswer.signature) {
          return next(new Error(`Malformed JSON: ${JSON.stringify(result)}`));
        }
        confirmation.signature[receivedAnswer.from] = receivedAnswer.signature;
        console.log('Proposal confirmed by', receivedAnswer.from);
      })

      if (!Enforcement.checkConfirmed(processCase, wallet, confirmation)) {
        return next(new Error(`Proposal for ${confirmation.step!.taskID} failed: confirmation(s) missing.`));
      }

      // Send async all OKs to others (via /confirm/)
      Promise.all(broadcast(
        requestServer, 
        otherParticipants, 
        confirmation, 
        "POST", 
        "/confirm/" + confirmation.step!.taskID
      ))
      .catch(e => console.error(e))

      // responds to local BPMS with OK 
      processCase.steps.push(confirmation.step!);
      processCase.tokenState = confirmation.step!.newTokenState;
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify({message: confirmation}));
      return next();
    })
    .catch(error => {
      return next(error);
    })
  }
}
export default enactController;