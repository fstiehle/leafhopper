import https from 'https';
import RoutingInformation from '../classes/RoutingInformation';

const request = (options: RoutingInformation, method: string, path: string, data: string): Promise<string> => {
  console.log(`${method} request to ${options.hostname}:${options.port}${path}`);
  return new Promise((resolve, reject) => {
    const req = https.request({...options/*TODO:, ca: process.env.ROOT_CA*/, path, method}, (res) => {
      res.setEncoding('utf8');
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`${res.statusCode} ${responseBody}`));
        } else {
          try {
            resolve(responseBody);
          } catch (error: any) {
            reject(new Error(error));
          }
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(data)
    req.end();
  });
}

export default request;