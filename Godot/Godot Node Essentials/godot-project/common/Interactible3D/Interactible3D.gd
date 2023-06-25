# ANCHOR: onready
extends RigidBody
class_name Interactible3D

onready var _animator: AnimationPlayer = $AnimationPlayer
# END: onready
## Virtual function
func play(_is_playing: bool) -> void:
	pass
# ANCHOR: highlight
func highlight() -> void:
	_animator.play("Highlight")
	_animator.seek(0, true)
# END: highlight
