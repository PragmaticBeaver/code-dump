extends Area

# ANCHOR: properties
export var max_speed := 4.0

var _velocity := Vector3.ZERO
# END: properties

# ANCHOR: ready
func _ready() -> void:
	connect("body_entered", self, "_on_body_entered")
# END: ready


# ANCHOR: processing
func _process(delta: float) -> void:
	var attractors := get_overlapping_areas()

	if attractors:
		var desired_velocity: Vector3 = (
			(attractors[0].global_transform.origin - global_transform.origin).normalized()
			* max_speed
		)
		var steering := desired_velocity - _velocity
		_velocity += steering / 14.0
	else:
		_velocity = Vector3.ZERO

	global_transform.origin += _velocity * delta
# END: processing


# ANCHOR:body_entered
func _on_body_entered(_body: Node) -> void:
	queue_free()
# END:body_entered
