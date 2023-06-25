extends "res://common/Enemy3D/SmartRobot/SmartRobot3D.gd"

# ANCHOR: onready
onready var _visiblity_notifier: VisibilityNotifier = $VisibilityNotifier


func _ready() -> void:
	_visiblity_notifier.connect("camera_entered", self, "_on_VisibilityNotifier_camera_changed", [true])
	_visiblity_notifier.connect("camera_exited", self, "_on_VisibilityNotifier_camera_changed", [false])
#END: onready

# ANCHOR: camera_changed
func _on_VisibilityNotifier_camera_changed(camera: Camera, is_visible: bool) -> void:
	if camera.is_in_group("debug_camera"):
		return
	sleeping = not is_visible
# END: camera_changed
