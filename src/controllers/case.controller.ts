import { Request, Response, NextFunction } from 'express';
import ICase from '../interfaces/ICase';

export default class caseController {
  
  static get(process: ICase) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const caseID = req.params.case;
      console.log('case get request for case', caseID);

      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify({message: process.steps[process.index]}));
      return next();
    }
  }

}
