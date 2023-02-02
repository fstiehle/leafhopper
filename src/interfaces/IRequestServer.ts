import RoutingInformation from "../classes/RoutingInformation";

export default interface IRequestServer {
  (options: RoutingInformation, method: string, path: string, data: string): Promise<string>;
}