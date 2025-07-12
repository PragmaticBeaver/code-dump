class_name EventBus extends Node

var _subscriptions := {}  # { event_name: { id: Callable} }


func subscribe(event_name: String, callback: Callable) -> EventBusToken:
	var id := Time.get_unix_time_from_system()  # could be problematic for multiplayer

	var is_event_known := _subscriptions.has(event_name)
	if not is_event_known:
		_subscriptions[event_name] = {}

	var subscribers: Dictionary = _subscriptions.get(event_name)
	subscribers[id] = callback

	return EventBusToken.new(event_name, id)


func unsubscribe(token: EventBusToken) -> void:
	var is_event_known := _subscriptions.has(token.event_name)
	if not is_event_known:
		return

	var subscribers: Dictionary = _subscriptions.get(token.event_name)
	var key_not_found := subscribers == null
	if key_not_found:
		return

	subscribers.erase(token.id)

	var is_empty := subscribers.size() <= 0
	if is_empty:
		_subscriptions.erase(token.event_name)


func publish(event_name: String, data: Variant = null, execute_deferred: bool = false) -> void:
	var is_event_known := _subscriptions.has(event_name)
	if not is_event_known:
		return

	var subscribers: Dictionary = _subscriptions.get(event_name)
	if subscribers.size() == 0:
		return

	Logger.event(self.get_parent().name, event_name, subscribers.size(), execute_deferred)

	for key in subscribers:
		var sub: Callable = subscribers[key]
		if execute_deferred == true:
			if data == null:  # bug: can't pass null value to call_deferred!
				sub.call_deferred()
			else:
				sub.call_deferred(data)
		else:
			if data == null:  # bug: can't pass null value to call!
				sub.call()
			else:
				sub.call(data)
