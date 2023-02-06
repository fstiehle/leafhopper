export default interface IRequestServer {
  (options: {hostname: string, port: number}, method: string, path: string, data: string): Promise<string>;
}