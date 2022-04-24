import { post } from "../utils/https";
import { IMessageClient } from "../application/IMessageClient";
import { MessageEvent } from "../entity/MessageEvent";

export class SlackClient implements IMessageClient {
  constructor(private webhookURL: string) {}

  async post(event: MessageEvent): Promise<void> {
    await post(
      this.webhookURL,
      {},
      JSON.stringify({
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
      })
    );
  }
}
