## Catches data dropped outside the grid and emits it back to the scene root.
# ANCHOR: signal
extends PanelContainer

signal data_recovered(texture)
# END: signal


# ANCHOR: data
func can_drop_data(_position: Vector2, dragged_texture: Texture) -> bool:
	return dragged_texture != null


func drop_data(_position: Vector2, dragged_texture: Texture) -> void:
	emit_signal("data_recovered", dragged_texture)
# END: data
