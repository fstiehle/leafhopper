import { Participant } from "../classes/Participants";
import IBroadcast from "../interfaces/IBroadcast";
import IRequestServer from "../interfaces/IRequestServer";

/**
 * 
 * @param requestServer 
 * @param step 
 * @param method 
 * @param path 
 * @returns 
 */
const broadcast: IBroadcast = (
  requestServer: IRequestServer, 
  participants: Participant[],
  message: any, 
  method: string, 
  path: string) => {

  const broadcast = new Array<Promise<any>>();
  for (const participant of participants) {
    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
      hostname: participant.hostname,
      port: participant.port
    }
    broadcast.push(requestServer(
      options,
      method,
      path,
      JSON.stringify({message})
    ));
  }
  return broadcast;
}

export default broadcast;