console.log("Loading function");

import { KinesisStreamEvent, KinesisStreamRecord } from "aws-lambda";
import { MessageEvent, EventRaw } from "./entity/MessageEvent";
import { Notification } from "./application/Notification";
import { SlackClient } from "./infrastructure/SlackClient";

const slackURL = process.env.SLACK_URL!;
const mailboxButtonIMEI = process.env.MAINBOX_BUTTON_IMEI!;

export async function handler(event: KinesisStreamEvent) {
  console.log(JSON.stringify(event, null, 2));

  const slackClient = new SlackClient(slackURL);
  const notification = new Notification(slackClient, mailboxButtonIMEI);

  for (const messageEvent of parseEvents(event.Records)) {
    await notification.execute(messageEvent);
  }
}

function parseEvents(records: KinesisStreamRecord[]) {
  const list = [];

  for (const record of records) {
    // Kinesis data is base64 encoded so decode here
    var body = JSON.parse(
      Buffer.from(record.kinesis.data, "base64").toString("ascii")
    );
    console.log("Decoded body:", body);

    if (body.imei === mailboxButtonIMEI) {
      list.push(
        new MessageEvent(
          body.imei,
          new EventRaw(
            body.payloads.clickType,
            body.payloads.clickTypeName,
            body.payloads.batteryLevel,
            body.payloads.binaryParserEnabled
          )
        )
      );
    }
  }

  return list;
}
