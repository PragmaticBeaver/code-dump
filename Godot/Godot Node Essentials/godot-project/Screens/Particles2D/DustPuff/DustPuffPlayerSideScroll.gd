extends BasePlayerSideScroll

onready var _dust_puff := $DustPuffSpawner


func _physics_process(delta: float) -> void:
	update_animation()
	update_look_direction()
	apply_base_movement(delta)
	# ANCHOR: dust_puff_trigger
	if is_landing():
		_dust_puff.spawn()
	# END: dust_puff_trigger
