import { Request, Response, NextFunction } from 'express';
import IEnforcement from '../interfaces/IEnforcement';
import IProcess from '../interfaces/IProcess';

const confirmController = (process: IProcess, enforcement: IEnforcement) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // incoming confirm message
    const taskID = parseInt(req.params.id);
    console.log('confirm', taskID);
    // check signatures (including my own)
    // install as new state
  }
}
export default confirmController;