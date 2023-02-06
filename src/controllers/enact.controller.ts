import { Request, Response, NextFunction, response } from 'express';
import IEnforcement from '../interfaces/IEnforcement';
import IProcess from '../interfaces/IProcess';
import IRequestServer from '../interfaces/IRequestServer';
import Step, { StepPublicProperties } from '../classes/Step';
import config from '../config/leafhopper.config'
import participants from '../config/participants.config';

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
  step: Step, 
  method: string, 
  path: string) => {

  const broadcast = new Array<Promise<any>>();
  for (const participant of participants.values()) {
    if (participant.id === config.IDENTITY.ID) continue; // Exclude myself from broadcast
    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
      hostname: participant.hostname,
      port: participant.port
    }
    broadcast[participant.id] = requestServer(
      options,
      method,
      path,
      JSON.stringify({step}) 
    );
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
const enactController = (process: IProcess, enforcement: IEnforcement, requestServer: IRequestServer) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // incoming message from local BPMS
    const taskID = parseInt(req.params.id);
    console.log('enact', taskID);
    // TODO: Check blockchain for possible dispute state
    // Propose enactment to all other nodes, collect OKs (via /propose/)
    const step = new Step({
      index: process.steps.length,
      from: config.IDENTITY.ID,
      caseID: process.caseID,
      taskID: taskID,
      newTokenState: enforcement.enact([...process.tokenState], taskID)
    });

    step.signature[config.IDENTITY.ID] = await enforcement.signature(step);

    // Broadcast 
    const proposeBroadcast = broadcast(requestServer, step, "GET", "/propose/"  + step.taskID);
    
    // Wait for ACKs of all participants
    Promise.all(proposeBroadcast).then(results => {
      results.forEach((result, participantID) => {
        const receivedStep = new Step(JSON.parse(result) as unknown as StepPublicProperties);
        if (!receivedStep) {
          throw new Error(`Malformed JSON: ${JSON.stringify(req.body)} to ${JSON.stringify(receivedStep)}`);
        }

        if (JSON.stringify(step.getSignable()) !== JSON.stringify(receivedStep.getSignable())) {
          throw new Error(`Propose answer from ${participantID}: different step`);
        }

        if (step.signature[config.IDENTITY.ID] !== receivedStep.signature[config.IDENTITY.ID]) {
          throw new Error(`Propose answer from ${participantID}: swapped signature`);
        }

        if (enforcement.address(receivedStep, receivedStep.signature[participantID])
          !== participants.get(participantID)!.pubKey
        ) {
          throw new Error(`Propose answer from ${participantID}: signature verification failed.`);
        }

        step.signature[participantID] = receivedStep.signature[participantID];
        console.log('Propose confirmed by', participantID);
      })

      // Send async all OKs to others (via /confirm/)
      broadcast(requestServer, step, "POST", "/confirm/"  + step.taskID);
      // responds to local BPMS with OK 
      process.steps.push(step);
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify({step}));
      return next();
    })
  }
}
export default enactController;