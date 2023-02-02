// A class used by Routing.ts to encapsulate a participants' routing related information.
export default class RoutingInformation {
  participant: number
  // HTTP options
  hostname: string;
  port: number;
  // path = "";
  // method = "";

  constructor(participant: number, hostname: string, port: number) {
    this.participant = participant;
    this.hostname = hostname;
    this.port = port;
  }
}