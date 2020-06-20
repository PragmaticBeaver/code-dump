using Godot;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

public class SubscriptionToken
{
    public Guid Id { get; private set; }
    public string Topic { get; private set; }

    public SubscriptionToken(Guid id, string topic)
    {
        this.Id = id;
        this.Topic = topic;
    }
}

public class Broker : Node
{
    private Dictionary<string, Dictionary<Guid, Func<Task>>> TopicSubscriptions = new Dictionary<string, Dictionary<Guid, Func<Task>>>();

    public SubscriptionToken Subscribe(Func<Task> subscriber, string topic)
    {
        var id = Guid.NewGuid();

        var doesntContainKey = !this.TopicSubscriptions.ContainsKey(topic);
        if (doesntContainKey)
        {
            var sub = new Dictionary<Guid, Func<Task>>();
            sub.Add(id, subscriber);
            this.TopicSubscriptions.Add(topic, sub);
        }
        else
        {
            var subs = this.TopicSubscriptions[topic];
            subs.Add(id, subscriber);
        }

        return new SubscriptionToken(id, topic);
    }

    public void Unsubscribe(SubscriptionToken token)
    {
        var doesntContainKey = !this.TopicSubscriptions.ContainsKey(token.Topic);
        if (doesntContainKey)
        {
            return;
        }

        this.TopicSubscriptions[token.Topic].Remove(token.Id);

        var isEmpty = this.TopicSubscriptions[token.Topic].Count <= 0;
        if (isEmpty)
        {
            this.TopicSubscriptions.Remove(token.Topic);
        }
    }

    public async void Publish(string topic, params object[] args)
    {
        var doesntContainKey = !this.TopicSubscriptions.ContainsKey(topic);
        if (doesntContainKey)
        {
            return;
        }

        foreach (var s in this.TopicSubscriptions[topic])
        {
            await s.Value.Invoke();
        }
    }
}