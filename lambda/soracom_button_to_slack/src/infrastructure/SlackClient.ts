import { post } from "../utils/https";
import { IMessageClient } from "../application/IMessageClient";
import { MessageEvent } from "../entity/MessageEvent";

export class SlackClient implements IMessageClient {
  constructor(private webhookURL: string) {}

  async post(event: MessageEvent): Promise<void> {
    const body = await post(
      this.webhookURL,
      { "Content-Type": "application/json" },
      JSON.stringify({
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
      })
    );
    console.log(`response body: ${body}`);
  }
}
