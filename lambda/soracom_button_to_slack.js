console.log('Loading function');

const https = require('https');
const url = require('url');
const slack_url = process.env.slack_url;
const mailbox_button_imei = process.env.mailbox_button_imei;
const slack_req_opts = url.parse(slack_url);
slack_req_opts.method = 'POST';
slack_req_opts.headers = {'Content-Type': 'application/json'};

exports.handler = function(event, context) {
    console.log(JSON.stringify(event, null, 2));
    event.Records.forEach(function(record) {
        // Kinesis data is base64 encoded so decode here
        var body = JSON.parse(Buffer.from(record.kinesis.data, 'base64').toString('ascii'));
        console.log('Decoded body:', body);

        if(body.imei === mailbox_button_imei) {
            console.log('button pushed');
            post_to_slack(body.payloads, context);
        }
    });
};

function post_to_slack(payloads, context) {
  var req = https.request(slack_req_opts, function (res) {
      if (res.statusCode === 200) {
          context.succeed('posted to slack');
      } else {
          context.fail('status code: ' + res.statusCode);
      }
  });

  req.on('error', function (e) {
      console.log('problem with request: ' + e.message);
      context.fail(e.message);
  });

  req.write(JSON.stringify({
    "text": "ポストに投函されたよ :mailbox_with_mail:",
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "ポストに投函されたよ :mailbox_with_mail:"
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "```" + JSON.stringify(payloads, null, 2) + "```"
        }
      }
    ]
  }));

  req.end();
};
