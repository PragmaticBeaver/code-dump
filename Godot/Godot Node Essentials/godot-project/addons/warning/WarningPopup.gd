extends ColorRect

func _input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_cancel"):
		queue_free()

func _on_ConfirmationDialog_confirmed() -> void:
	queue_free()
