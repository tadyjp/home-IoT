import * as https from "https";

export function get(_url: string, headers: any): Promise<string> {
  const url = new URL(_url);

  const options = {
    method: "GET",
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
        resolve(body);
      });

      res.on("error", function (e) {
        reject(e);
      });
    });

    req.on("error", function (e) {
      reject(e);
    });

    req.end();
  });
}
