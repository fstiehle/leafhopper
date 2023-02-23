import { Request, Response, NextFunction } from 'express';
import ICase from '../interfaces/ICase';
import IWallet from '../interfaces/IWallet';
import IProof from '../interfaces/IProof';

const attachController = (processCase: ICase, wallet: IWallet) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const address = req.params.address;
    console.log('attach request with address', address);

    processCase.caseID = 0;
    processCase.tokenState = 1;
    processCase.steps = new Array<IProof>();
    wallet.attach(address);
    res.sendStatus(200);
    return next();
  }
}

export default attachController;