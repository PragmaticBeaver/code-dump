tool
extends EditorPlugin

var popup: ConfirmationDialog = preload("WarningPopup.tscn").instance()

func _enter_tree() -> void:
	yield(get_tree().create_timer(0.2), "timeout")
	var version := Engine.get_version_info()
	if version.major != 3 or version.minor < 5:
		add_child(popup)
		popup.popup_centered()
		

func _exit_tree() -> void:
	popup.queue_free()
