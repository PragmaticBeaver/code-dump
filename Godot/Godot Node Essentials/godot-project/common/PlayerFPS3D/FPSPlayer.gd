extends KinematicBody
class_name FPSPlayer


export var mouse_sensitivity := 0.25

export var move_speed := 5.0
export var acceleration := 4.0
export var jump_impulse := 6.0
export var snap_length := 0.5
# ANCHOR: tilt_variables
export var rotation_speed := 1.0
export var tilt_speed := 1.0

export(float, -90, 0.0) var tilt_upper_limit := -60.0
export(float, 0.0, 90.0) var tilt_lower_limit := 60.0
# END: tilt_variables
# ANCHOR: variables
var _yaw_input := 0.0
var _tilt_input := 0.0
# END: variables
var _velocity := Vector3.ZERO
var _snap := Vector3.DOWN * snap_length
# ANCHOR: pivot
onready var _tilt_pivot: Spatial = $TiltPivot
# END: pivot
onready var _gravity: float = -ProjectSettings.get_setting("physics/3d/default_gravity")
onready var _start_position := global_transform.origin

# ANCHOR: input
func _input(event: InputEvent) -> void:
	if event is InputEventMouseMotion and Input.get_mouse_mode() == Input.MOUSE_MODE_CAPTURED:
		_yaw_input = -event.relative.x * mouse_sensitivity
		_tilt_input = -event.relative.y * mouse_sensitivity
# END: input


# ANCHOR: process
func _physics_process(delta: float) -> void:
	_yaw_input += Input.get_action_strength("camera_left") - Input.get_action_strength("camera_right")
	_tilt_input += Input.get_action_strength("camera_up") - Input.get_action_strength("camera_down")

	rotate_y(_yaw_input * rotation_speed * delta)
	_tilt_pivot.rotate_x(_tilt_input * tilt_speed * delta)
	_tilt_pivot.rotation_degrees.x = clamp(
		_tilt_pivot.rotation_degrees.x,
		tilt_upper_limit,
		tilt_lower_limit)
# END: process
	var input_right_left := Input.get_action_strength("move_right") - Input.get_action_strength("move_left")
	var input_back_forward := Input.get_action_strength("move_down") - Input.get_action_strength("move_up")
	var raw_input := Vector2(input_right_left, input_back_forward)

	#ANCHOR: velocity
	var input := Vector3.ZERO
	input.x = raw_input.x * sqrt(1.0 - raw_input.y * raw_input.y / 2.0)
	input.z = raw_input.y * sqrt(1.0 - raw_input.x * raw_input.x / 2.0)

	input = global_transform.basis.xform(input)

	var y_velocity := _velocity.y
	_velocity.y = 0.0
	_velocity = _velocity.linear_interpolate(input * move_speed, delta * acceleration)
	_velocity.y = y_velocity
	#END: velocity

	if is_on_floor():
		_velocity.y = 0.0
	else:
		_velocity.y += _gravity * delta

	# ANCHOR: jump_conditions
	if is_jumping():
		_velocity.y = jump_impulse
		_snap = Vector3.ZERO
	elif is_landing():
		_snap = Vector3.DOWN * snap_length
	# END:jump_conditions

	# ANCHOR:move_and_slide
	_velocity = move_and_slide_with_snap(
		_velocity, _snap, Vector3.UP, true, 4, deg2rad(45), true
	)
	# END:move_and_slide
	# ANCHOR: zero
	# zero out input before next frame
	_yaw_input = 0.0
	_tilt_input = 0.0
	# END: zero


func is_jumping() -> bool:
	return Input.is_action_just_pressed("jump_3d") and is_on_floor()


func is_landing() -> bool:
	return _snap == Vector3.ZERO and is_on_floor()


func reset_position() -> void:
	global_transform.origin = _start_position
