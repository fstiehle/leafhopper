process.env.NODE_ENV = 'test';

import chai from 'chai';
import chaiHttp from 'chai-http';
import {ethers} from 'ethers';
const {expect} = chai;
import Enforcement from "../src/services/enforcement.service";
import { Server } from 'node:http';
import { Participant } from '../src/interfaces/IParticipants';
import { _Wallet } from '../src/interfaces/IWallet';
import AppServer from '../src/classes/AppServer';

Enforcement.enact = (tokenState: number[], taskID: number, participantID: number): number[] => {
  console.warn("Testing without conformance check.");
  tokenState.push(1);
  return tokenState;
}

chai.use(chaiHttp);

describe('Test api calls with dummy conformance check', () => {
  const NUMBER_OF_PARTICIPANTS = 4;

  const servers = new Map<number, Server>();
  const participants = new Map<number, Participant>();
  const wallets = new Map<number, _Wallet>();

  before(() => {
    for (let index = 0; index < NUMBER_OF_PARTICIPANTS; index++) {
      const wallet = ethers.Wallet.createRandom();
      participants.set(index, {id: index, name:'', hostname: 'localhost', port: 9000 + index, pubKey: wallet.address})
      wallets.set(index, wallet);
    }

    for (const participant of participants.values()) {
      servers.set(participant.id, AppServer.listen(participant.port, participant.id, wallets.get(participant.id)!, participants))
    }
  })

  it('/enact/', async () => {
    return chai.request(servers.get(0))
      .get('/enact/0')
      //.ca(Buffer.from(rootCA))
      .set('content-type', 'application/json')
      .then(res => {
        expect(res).to.have.status(200);
      })
      .catch(err => {
        console.log(err);
        expect(err).to.be.null;
     });
  });

  it('/propose/ with invalid data', async () => {
    return chai.request(servers.get(0))
      .post('/propose/0')
      //.ca(Buffer.from(rootCA))
      .set('content-type', 'application/json')
      .then(res => {
        expect(res).to.have.status(500);
      })
      .catch(err => {
        console.log(err);
        expect(err).to.be.null;
     });
  });

  it('/confirm/ with invalid data', async () => {
    return chai.request(servers.get(0))
      .post('/confirm/0')
      //.ca(Buffer.from(rootCA))
      .set('content-type', 'application/json')
      .then(res => {
        expect(res).to.have.status(500);
      })
      .catch(err => {
        console.log(err);
        expect(err).to.be.null;
     });
  });

  after(() => {
    for (const [_, server] of servers) {
      server.close();
    }
  });

});