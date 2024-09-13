class_name EventBusToken extends RefCounted

var event_name: String
var id: float


func _init(evt_name: String, uuid: float):
	event_name = evt_name
	id = uuid
