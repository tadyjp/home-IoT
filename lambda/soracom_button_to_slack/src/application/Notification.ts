import { MessageEvent } from "../entity/MessageEvent";
import { IMessageClient } from "./IMessageClient";

export class Notification {
  constructor(
    private client: IMessageClient,
    private mailboxButtonIMEI: string
  ) {}

  async execute(event: MessageEvent): Promise<boolean> {
    if (event.imei !== this.mailboxButtonIMEI) {
      throw new Error(
        `IMEI mismatch: ${event.imei} is not ${this.mailboxButtonIMEI}`
      );
    }
    await this.client.post(event);
    return true;
  }
}
