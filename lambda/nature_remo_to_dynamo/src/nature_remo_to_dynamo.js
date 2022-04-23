const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB();
const dynamoTable = "nature-remo-sensor-2";

const natureRemoToken = process.env.NATURE_REMO_TOKEN;
const natureRemoDevice

const natureRemoReqOpts = url.parse(slack_url);
natureRemoReqOpts.method = 'GET';
natureRemoReqOpts.headers = {'Authorization': 'Bearer ' + natureRemoToken};

exports.handler = async (event, context) => {
  const natureRemoValues = await getNatureRemoValues();

  const living = natureRemoValues.find(el => el.serial_number === '1W320100017177') // リビング

  const res = await dynamoPutItem({
    TableName: dynamoTable,
    Item: {
      DeviceID: {S: "id1"},
      Timestamp: {N: (Date.now()/1000).toString()},
      Temperature: {N: "28"},
      Humidity: {N: "32"},
      Illuminance: {N: "0.1"},
      Motion: {N: "1"}
    }
  });

  return res;
};

function getNatureRemoValues() {
  return new Promise((resolve, reject) => {
    var req = https.request(natureRemoReqOpts, function (res) {
      var data = [];

      if (res.statusCode === 200) {
        res.on('data', function(chunk) {
          data.push(chunk);
        });

        res.on('end', function() {
          var body = JSON.parse(Buffer.concat(data));
          resolve(body);
        });
      } else {
        reject(new Error('statusCode=' + res.statusCode));
      }
    });

    req.on('error', reject);

    req.end();
  });
};

function dynamoPutItem(obj){
  return new Promise((resolve, reject) => {
    const params = obj;
    dynamo.putItem(params, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve("updated");
      }
    });
  });
}
