extends HBoxContainer

var duration = 0.2
var is_animating = false
var is_expanded = false
var h_size = 1024
var v_size = 512
var scale_k = 0.2
var scale_diff = 0.05
var constant_scale = false

func _ready():
	$TextureRect2/Label.modulate.a = 0

func show_box(delay = 0, const_scale = false):
	
	if is_expanded:
		return
	is_expanded = true
	
	constant_scale = const_scale
	
	$Tween.interpolate_method(self, 'interpolate_box_size', 0, 1, duration, Tween.TRANS_CUBIC, Tween.EASE_OUT, delay)
	$Tween.start()
	
	yield($Tween, "tween_completed")
	
	$Tween.interpolate_property($TextureRect2/Label, 'modulate:a', 0, 1, duration, Tween.TRANS_CUBIC, Tween.EASE_IN)
	$Tween.start()
	
	is_expanded = true
	
func hide_box(delay = 0):
	
	if !is_expanded:
		return
	is_expanded = false
#	$Tween.interpolate_property($TextureRect2/Label, 'modulate:a', 1, 0, duration/2, Tween.TRANS_CUBIC, Tween.EASE_IN)
#	$Tween.start()
#
#	yield($Tween, "tween_all_completed")

	$Tween.stop_all()
	$Tween.reset_all()

	$TextureRect2/Label.modulate.a = 0
	
	$Tween.interpolate_method(self, 'interpolate_box_size', 1, 0, duration, Tween.TRANS_CUBIC, Tween.EASE_OUT, delay)
	$Tween.start()
	
	is_expanded = false
	
func set_text(text : String):
	$TextureRect2/Label.text = text
	
func interpolate_box_size(percent):
	is_animating = true

	var box = $TextureRect2
	
	box.set_custom_minimum_size(Vector2(h_size * percent, v_size))
	
	if constant_scale:
		rect_scale = Vector2.ONE * scale_k
	else:
		rect_scale = Vector2.ONE * (scale_k + scale_diff * percent) 
	
	if percent == 1:
		is_animating = false
