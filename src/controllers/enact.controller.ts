import { Request, Response, NextFunction } from 'express';
import IEnforcement from '../interfaces/IEnforcement';
import IProcess from '../interfaces/IProcess';
import IRequestServer from '../interfaces/IRequestServer';

const enactController = (process: IProcess, enforcement: IEnforcement, requestServer: IRequestServer) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // incoming message from local BPMS
    const taskID = parseInt(req.params.id);
    console.log('enact', taskID);
    // Propose enactment to all other nodes, collect OKs
    // Send async all OKs to others (via /confirm/), responds to local BPMS with OK 
  }
}
export default enactController;