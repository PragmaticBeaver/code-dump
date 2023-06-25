extends Node2D

# ANCHOR: attack_patterns
const ATTACK_PATTERN_REPETITIONS := {"cooldown": 2, "burst": 3, "spray": 1}
# END: attack_patterns

export var player_path: NodePath

onready var _shoot_animator := $Pivot/Gun/AnimationShoot
# ANCHOR: anim_player
onready var _pattern_animator := $Pivot/AnimationPattern
# END: anim_player
onready var _bullet_launcher := $Pivot/Gun/BulletLauncher

# ANCHOR: player_var
onready var _player: Player = get_node_or_null(player_path)
# END: player_var


# ANCHOR: ready
func _ready() -> void:
	randomize()
	_pattern_animator.connect("animation_finished", self, "_on_AnimationPattern_animation_finished")
	queue_shooting_pattern()
# END: ready


# ANCHOR: process
func _process(_delta: float) -> void:
	if not _player:
		return
	look_at(_player.global_position)
# END: process


# ANCHOR: queue
func queue_shooting_pattern() -> void:
	# Get the attack animation names from the dictionary.
	var animations: Array = ATTACK_PATTERN_REPETITIONS.keys()
	# Randomize the order of our list of attacks, so the item at the front will
	# be random.
	animations.shuffle()
	var first_key: String = animations.front()

	# Find out how many times our animation should repeat
	for _x in range(ATTACK_PATTERN_REPETITIONS[first_key]):
		# Queue the animation so it will repeat for each time it's called in the
		# loop.
		_pattern_animator.queue(first_key)
# END: queue


func shoot() -> void:
	_bullet_launcher.fire()
	_shoot_animator.stop()
	_shoot_animator.play("shoot")


# ANCHOR: callback
# We need this callback because the signal comes with an argument but our
# queue_shooting_pattern() function takes none.
func _on_AnimationPattern_animation_finished(_anim_name: String) -> void:
	queue_shooting_pattern()
# END: callback
