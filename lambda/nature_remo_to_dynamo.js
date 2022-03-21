const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB();

exports.handler = async (event) => {

    const item = {
      DeviceID: {S: "id1"},
      Timestamp: {N: Date.now()/1000},
      Temperature: {N: 28},
      Humidity: {N: 32},
      Illuminance: {N: 0.1},
      Motion: {N: 1}
    };

    const res= await dynamoPutItem({
      "TableName": "nature-remo-sensor",
      "Item": item
    });

    return res;
};

function dynamoPutItem(obj){
  return new Promise((resolve, reject) => {
    const params = obj;
    dynamo.putItem(params, function(err, data) {
        if (err) {
            reject(err, err);
        } else {
            resolve("updated");
        }
    });
  });
}
