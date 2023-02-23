import http from 'http';
import IRequestServer from '../interfaces/IRequestServer';

const keepAliveAgent = (() => {
  if (process.env.NODE_ENV !== 'production') {
    return new http.Agent({
      keepAlive: false
    });
  } else {
    return new http.Agent({
      keepAlive: true,
      timeout: 24000
    });
  }
})();

const request: IRequestServer = (
  _options: {hostname: string, port: number},
  method: string, 
  path: string, 
  data?: string): Promise<string> => {

  console.log(`${method} request to ${_options.hostname}:${_options.port}${path}`);
  return new Promise((resolve, reject) => {

    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
      agent: keepAliveAgent,
      ..._options
    }

    const req = http.request({...options, path, method}, (res) => {
      res.setEncoding('utf8');
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        if (res.statusCode !== 200) {
          const error = new Error(responseBody);
          error.name = res.statusCode ? res.statusCode.toString() : "unknown";
          reject(error);
        } else {
          resolve(responseBody);
        }
      });
    });

    req.on('error', (err) => {
      if (req.reusedSocket) {
        console.log("Reused socket!")
      }
      reject(err);
    });

    if (data != null) {
      req.write(data);
    }

    req.end();
  });
}

export default request;