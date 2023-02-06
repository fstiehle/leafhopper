import express, { Express, Request, Response, NextFunction } from 'express';
import proposeRoute from '../routes/propose.route';
import IRequestServer from '../interfaces/IRequestServer';
import enactRoute from '../routes/enact.route';
import IProcess from '../interfaces/IProcess';
import IEnforcement from '../interfaces/IEnforcement';
import confirmRoute from '../routes/confirm.route';

const routes = (
  app: Express, 
  process: IProcess, 
  enforcement: IEnforcement, 
  requestServer: IRequestServer) => {

  app.use(express.json());
  app.use('/enact/', enactRoute(process, enforcement, requestServer));
  app.use('/propose/', proposeRoute(process, enforcement));
  app.use('/confirm/', confirmRoute(process, enforcement));

  app.get("/", (_, res, next) => {
    res.sendStatus(200);
    return next();
  });

  app.use((error: Error, _: Request, response: Response, next: NextFunction) => {
    const message = error.message || 'Something went wrong';
    console.error(message);
    response
      .status(500)
      .send(message);

    return next();
  });
}
export default routes;