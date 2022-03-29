console.log("Loading function");

import { KinesisStreamEvent } from "aws-lambda";
import { Event, EventRaw } from "./entity/Event";
import { Notification } from "./application/Notification";
import { SlackClient } from "./infrastructure/SlackClient";

const slackURL = process.env.SLACK_URL!;
const mailboxButtonIMEI = process.env.MAINBOX_BUTTON_IMEI!;

export async function handler(event: KinesisStreamEvent) {
  console.log(JSON.stringify(event, null, 2));

  const slackClient = new SlackClient(slackURL);
  const notification = new Notification(slackClient, mailboxButtonIMEI);

  for (const record of event.Records) {
    // Kinesis data is base64 encoded so decode here
    var body = JSON.parse(
      Buffer.from(record.kinesis.data, "base64").toString("ascii")
    );
    console.log("Decoded body:", body);

    if (body.imei === mailboxButtonIMEI) {
      const event = new Event(
        body.imei,
        new EventRaw(
          body.payloads.clickType,
          body.payloads.clickTypeName,
          body.payloads.batteryLevel,
          body.payloads.binaryParserEnabled
        )
      );

      await notification.execute(event);
    }
  }
}
