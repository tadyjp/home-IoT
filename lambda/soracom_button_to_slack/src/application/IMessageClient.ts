import { MessageEvent } from "../entity/MessageEvent";

export interface IMessageClient {
  post(event: MessageEvent): Promise<void>;
}
