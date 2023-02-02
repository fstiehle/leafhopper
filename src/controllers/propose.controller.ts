import { Request, Response, NextFunction } from 'express';
import IEnforcement from '../interfaces/IEnforcement';
import IProcess from '../interfaces/IProcess';

const proposeController = (process: IProcess, enforcement: IEnforcement) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // incoming propose message
    const taskID = parseInt(req.params.id);
    console.log('enact', taskID);
    // conformance check and respond with NAY or OK
    // 
  }
}
export default proposeController;