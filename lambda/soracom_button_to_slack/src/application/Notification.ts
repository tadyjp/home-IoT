import { Event } from "../entity/Event";
import { IMessageClient } from "./IMessageClient";

export class Notification {
  constructor(
    private client: IMessageClient,
    private mailboxButtonIMEI: string
  ) {}

  async execute(event: Event): Promise<void> {
    if (event.imei !== this.mailboxButtonIMEI) {
      console.log(`IMEI ${event.imei} is not ${this.mailboxButtonIMEI}`);
      return;
    }
    return await this.client.post(event);
  }
}
