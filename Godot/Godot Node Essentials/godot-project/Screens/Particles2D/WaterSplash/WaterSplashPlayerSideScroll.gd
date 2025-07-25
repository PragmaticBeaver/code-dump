extends BasePlayerSideScroll

export var splash_fall_threshold := 1000.0

onready var _water_splash_spawner := $WaterSplashSpawner
onready var _water_detecting_area := $WaterDetectingArea2D

# ANCHOR: onready
func _ready() -> void:
	_water_detecting_area.connect("area_entered", self, "_on_WaterDetectingArea2D_area_entered")
# END: onready


func _physics_process(delta: float) -> void:
	update_animation()
	update_look_direction()
	apply_base_movement(delta)


# ANCHOR: water_entered_signal
func _on_WaterDetectingArea2D_area_entered(area: Area2D) -> void:
	if _velocity.y < splash_fall_threshold:
		return
	_water_splash_spawner.spawn()
# END: water_entered_signal
