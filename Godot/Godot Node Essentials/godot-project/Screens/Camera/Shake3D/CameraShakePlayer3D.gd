extends FPSPlayer

# ANCHOR: shake
onready var _camera: Camera = find_node("Camera")

func take_damage() -> void:
	_camera.shake_intensity += 0.7
# END: shake
