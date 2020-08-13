import "mocha";
import { EventBus } from "./event-bus";
import { assert } from "chai";

describe("EventBus", async () => {
  it("should add subscriber", async () => {
    const sut = new EventBus();
    const topic = "testTopic";

    const result = sut.subscribe(topic, async () => {
      console.log("hello test");
    });

    assert.isNotNull(result);
    assert.isNotNull(result.Id);
  });

  it("should remove subscriber", async () => {
    const sut = new EventBus();
    const topic = "testTopic";

    const token = sut.subscribe(topic, async () => {
      throw new Error("i should not be called!");
    });
    sut.unsubscribe(token);

    await sut.publish(topic);
  });

  it("should only remove specified subscriber", async () => {
    const sut = new EventBus();
    const topic = "testTopic";

    const token = sut.subscribe(topic, async () => {
      throw new Error("i should not be called!");
    });

    let wasCalled = false;
    sut.subscribe(topic, async () => {
      wasCalled = true;
    });

    sut.unsubscribe(token);
    await sut.publish(topic);

    assert.isTrue(wasCalled);
  });

  it("should call subscriber callback", async () => {
    const sut = new EventBus();
    const topic = "testTopic";

    let wasCalled = false;
    sut.subscribe(topic, async () => {
      wasCalled = true;
    });

    await sut.publish(topic);

    assert.isTrue(wasCalled);
  });

  it("should call every subscriber callback", async () => {
    const sut = new EventBus();
    const topic = "testTopic";

    let firstCbWasCalled = false;
    sut.subscribe(topic, async () => {
      firstCbWasCalled = true;
    });
    let secondCbWasCalled = false;
    sut.subscribe(topic, async () => {
      secondCbWasCalled = true;
    });
    let thirdCbWasCalled = false;
    sut.subscribe(topic, async () => {
      thirdCbWasCalled = true;
    });

    await sut.publish(topic);

    assert.isTrue(firstCbWasCalled);
    assert.isTrue(secondCbWasCalled);
    assert.isTrue(thirdCbWasCalled);
  });

  it("should sort subscriber depending on placeInOrder", async () => {
    const sut = new EventBus();
    const topic = "testTopic";
    const firstSubscribedId = "firstSub";
    const lastSubscribedId = "lastSub";

    const calls: string[] = [];
    sut.subscribe(
      topic,
      async () => {
        calls.push(firstSubscribedId);
      },
      200
    );

    sut.subscribe(
      topic,
      async () => {
        calls.push(lastSubscribedId);
      },
      100
    );

    await sut.publish(topic);

    const secondResult = calls.pop();
    const firstResult = calls.pop();

    assert.isNotNull(firstResult);
    assert.isNotNull(secondResult);

    assert.equal(firstResult, lastSubscribedId);
    assert.equal(secondResult, firstSubscribedId);
  });
});
