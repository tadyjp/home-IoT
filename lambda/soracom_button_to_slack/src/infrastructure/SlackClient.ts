import fetch from "node-fetch";
import { IMessageClient } from "../application/IMessageClient";
import { Event } from "../entity/Event";

export class SlackClient extends IMessageClient {
  constructor(private webhookURL: string) {
    super();
  }

  async post(event: Event): Promise<void> {
    const response = await fetch(this.webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "ポストに投函されたよ :mailbox_with_mail:",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "ポストに投函されたよ :mailbox_with_mail:",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "```" + event.raw.printMarkdown() + "```",
            },
          },
        ],
      }),
    });

    if (response.status !== 200) {
      throw new Error("Failed to post to slack: status=" + response.status);
    }
  }
}
