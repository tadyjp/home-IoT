import * as https from "https";

export function post(
  _url: string,
  headers: any,
  payload: string
): Promise<any> {
  const url = new URL(_url);

  const options = {
    method: "POST",
    port: 443,
    protocol: url.protocol,
    host: url.hostname,
    path: url.pathname,
    headers: headers,
  };

  return new Promise((resolve, reject) => {
    let body = "";

    const req = https.request(options, function (res) {
      res.on("data", function (chunk) {
        body += chunk;
      });

      res.on("end", function () {
        resolve(JSON.parse(body));
      });

      res.on("error", function (e) {
        reject(e);
      });
    });

    req.on("error", function (e) {
      reject(e);
    });

    req.write(payload);

    req.end();
  });
}
