import express, { Express, Request, Response, NextFunction } from 'express';
import proposeRoute from '../routes/propose.route';
import IRequestServer from '../interfaces/IRequestServer';
import enactRoute from '../routes/enact.route';
import ICase from '../interfaces/ICase';
import confirmRoute from '../routes/confirm.route';
import IWallet from '../interfaces/IWallet';
import attachRoute from '../routes/attach.route';
import caseRoute from '../routes/case.route';

const routes = (
  app: Express, 
  process: ICase, 
  wallet: IWallet, 
  requestServer: IRequestServer) => {

  app.use(express.json());
  app.use('/enact/', enactRoute(process, wallet, requestServer));
  app.use('/propose/', proposeRoute(process, wallet));
  app.use('/confirm/', confirmRoute(process, wallet));
  app.use('/attach/', attachRoute(process, wallet));
  app.use('/case/', caseRoute(process));

  app.get("/", (_, res, next) => {
    res.sendStatus(200);
    return next();
  });

  app.use((error: Error, _: Request, response: Response, next: NextFunction) => {
    const message = error.message || 'Something went wrong';
    console.error("[Server] will respond with error:", message);
    response
      .status(500)
      .send(message);

    return next();
  });
}
export default routes;