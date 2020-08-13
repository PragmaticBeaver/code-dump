import { v4 as uuidv4 } from "uuid";

export interface EventToken {
  Id: string;
}

type EventCallback = (...args: []) => Promise<void>;

type Events = {
  [placeInOrder: number]: {
    [Id: string]: EventCallback;
  };
};

class Subscription {
  private events: Events = {};
  private idPosMap = new Map<string, number>();

  public add(placeInOrder: number, cb: EventCallback): EventToken {
    const placeInOrderNotExists = this.events[placeInOrder] === undefined;
    if (placeInOrderNotExists) {
      this.events[placeInOrder] = {};
    }

    const id = uuidv4();
    this.events[placeInOrder][id] = cb;

    this.idPosMap.set(id, placeInOrder);

    const token: EventToken = {
      Id: id,
    };
    return token;
  }

  public remove(token: EventToken): void {
    const id = token.Id;
    const placeInOrder = this.idPosMap.get(id);
    const idNotFound = placeInOrder === undefined;
    if (idNotFound) {
      return;
    }

    const pos = placeInOrder as number;
    delete this.events[pos][id];
    this.idPosMap.delete(id);

    const isEmpty = Object.keys(this.events[pos]).length === 0;
    if (isEmpty) {
      delete this.events[pos];
    }
  }

  public async call(...args: []): Promise<void> {
    for (const orderIndex in this.events) {
      const placeInOrder = parseInt(orderIndex);
      for (const id in this.events[placeInOrder]) {
        await this.events[placeInOrder][id](...args);
      }
    }
  }

  public isEmpty(): boolean {
    return Object.keys(this.events).length === 0;
  }
}

type SubscriptionByTopic = {
  [topic: string]: Subscription;
};

export class EventBus {
  private subscriptions: SubscriptionByTopic = {};

  public subscribe(
    topic: string,
    cb: EventCallback,
    placeInOrder = 500
  ): EventToken {
    const topicUnknown = this.subscriptions[topic] === undefined;
    if (topicUnknown) {
      this.subscriptions[topic] = new Subscription();
    }
    return this.subscriptions[topic].add(placeInOrder, cb);
  }

  public unsubscribe(token: EventToken): void {
    for (const topic in this.subscriptions) {
      this.subscriptions[topic].remove(token);

      const noSubscriberLeft = this.subscriptions[topic].isEmpty();
      if (noSubscriberLeft) {
        delete this.subscriptions[topic];
      }
    }
  }

  public async publish(topic: string, ...args: []): Promise<void> {
    const subs = this.subscriptions[topic];
    if (!subs) {
      return;
    }
    await subs.call(...args);
  }
}
