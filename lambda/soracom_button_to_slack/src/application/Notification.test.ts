import { Notification } from "./Notification";
import { IMessageClient } from "../application/IMessageClient";
import { MessageEvent, EventRaw } from "../entity/MessageEvent";

class SlackClientMock implements IMessageClient {
  async post(event: MessageEvent): Promise<void> {
    console.log(`Posting event: ${JSON.stringify(event)}`);
  }
}

test("invalid IMEI", async () => {
  const notification = new Notification(new SlackClientMock(), "valid-IMEI");
  await expect(
    notification.execute(
      new MessageEvent("invalid-IMEI", new EventRaw(3, "LONG", 1, true))
    )
  ).rejects.toThrow("IMEI mismatch");
});

test("valid IMEI", async () => {
  const notification = new Notification(new SlackClientMock(), "valid-IMEI");
  await expect(
    notification.execute(
      new MessageEvent("valid-IMEI", new EventRaw(3, "LONG", 1, true))
    )
  ).resolves.toBe(true);
});
