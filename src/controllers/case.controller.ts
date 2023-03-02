import { Request, Response, NextFunction } from 'express';
import ICase from '../interfaces/ICase';

export default class caseController {
  
  static get(process: ICase) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const caseID = req.params.case;
      console.log('case get request for case', caseID);

      const confirmation = process.steps[process.index];
      if (confirmation == null) {
        console.error("Index", process.index, "but steps", process.steps)
        res.sendStatus(500);
        return next();
      }

      console.log('returning index', process.index, 'with state', confirmation.newTokenState);
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify({message: confirmation}));
      return next();
    }
  }

}
