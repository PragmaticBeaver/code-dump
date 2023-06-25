extends Node2D
# ANCHOR: onready
export var arc_scene: PackedScene
export var enemy_path: NodePath

onready var _enemy := get_node(enemy_path)
# END: onready
onready var _timer: Timer = $Timer


func _process(_delta: float) -> void:
	if Input.is_action_pressed("shoot"):
		shoot()


func shoot() -> void:
	if not _timer.is_stopped():
		return

	_timer.start()
	# ANCHOR: shoot
	var shoot_vector = Vector2.UP.rotated(global_rotation)
	var arc = arc_scene.instance()

	add_child(arc)
	arc.fire(global_position, _enemy.global_position, shoot_vector)
	# END: shoot
