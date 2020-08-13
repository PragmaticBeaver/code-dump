import { EventBus } from "./event-bus";

export class Plugin {
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  public initialize(): void {
    //
  }
}
