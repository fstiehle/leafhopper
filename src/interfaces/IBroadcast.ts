import { Participant } from "../classes/Participants";
import IRequestServer from "./IRequestServer";

export default interface IBroadcast {
  (requestServer: IRequestServer, 
    participants: Participant[],
    message: any, 
    method: string, 
    path: string): Promise<any>[];
}