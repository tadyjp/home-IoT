import { Event } from "../entity/Event";

export abstract class IMessageClient {
  abstract post(event: Event): Promise<void>;
}
