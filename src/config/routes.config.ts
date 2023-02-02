import express, { Express } from 'express';
import proposeRoute from '../routes/propose.route';
import ICheckConformance from '../interfaces/IProcess';
import IRequestServer from '../interfaces/IRequestServer';
import enactRoute from '../routes/enact.route';

const routes = (
  app: Express, 
  checkConformance: ICheckConformance,
  requestServer: IRequestServer) => {

  app.use(express.json());
  app.use('/enact/', enactRoute(checkConformance, requestServer));
  app.use('/propose/', proposeRoute(checkConformance));
}
export default routes;