import { Request, Response, NextFunction } from 'express';
import ICase from '../interfaces/ICase';
import IProof from '../interfaces/IProof';

export default class caseController {
  
  static get(process: ICase) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const caseID = req.params.case;
      console.log('case get request for case', caseID);

      let lastState: IProof;
      if (process.steps.length === 0) {
        lastState = {
          caseID: process.caseID,
          from: -1,
          taskID: -1,
          newTokenState: 1,
          signatures: new Array<string>()
        }
      } else {
        lastState = process.steps[process.steps.length - 1];
      }

      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify({message: lastState}));
      return next();
    }
  }

}
