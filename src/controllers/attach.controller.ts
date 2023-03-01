import { Request, Response, NextFunction } from 'express';
import ICase from '../interfaces/ICase';
import IWallet from '../interfaces/IWallet';

const attachController = (processCase: ICase, wallet: IWallet) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const address = req.params.address;
    console.log('attach request with address', address);

    processCase.reset();
    wallet.attach(address);
    res.sendStatus(200);
    return next();
  }
}

export default attachController;