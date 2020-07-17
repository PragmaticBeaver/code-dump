extends Control

var active_element = 0
var unfolded_elements = 0
var is_animating = false
var is_in_list_mode = false

var scale_k = 0.2
var scale_diff = 0.05

var duration = 0.2

func _ready():
	
	for i in $buttons.get_child_count():
		var child = $buttons.get_child(i)
		child.rect_scale = Vector2.ZERO
	
	var timer = Timer.new()
	timer.one_shot = true
	add_child(timer)
	timer.connect('timeout', self, 'initiate')
	timer.start(1)
#	initiate()

func initiate():
	#	var duration = 0.3
	is_animating = true
	for i in $buttons.get_child_count():
		var child = $buttons.get_child(i)
		child.rect_scale = Vector2.ZERO
		$Tween.interpolate_property(child, 'rect_rotation', 0, 60 * i, i * duration / 2, Tween.TRANS_LINEAR, Tween.EASE_OUT)
		$Tween.interpolate_property(child, 'rect_scale', Vector2.ZERO, Vector2.ONE * scale_k, duration, Tween.TRANS_CUBIC, Tween.EASE_OUT)
	$Tween.start()

	yield($Tween, 'tween_all_completed')

	$buttons.get_child(0).set_text('I have')
	$buttons.get_child(1).set_text('no idea')
	$buttons.get_child(2).set_text('why')
	$buttons.get_child(3).set_text('I did')
	$buttons.get_child(4).set_text('this')
	$buttons.get_child(5).set_text('o____O')

	$buttons.get_child(active_element).show_box()
	is_animating = false


func _input(event):
	
	if is_animating:
		return
		
	if is_in_list_mode:
		var new_unfolded = unfolded_elements
		if event.is_action_pressed("ui_down"):
			new_unfolded += 1
			
		if event.is_action_pressed("ui_up"):
			new_unfolded -= 1
			
		new_unfolded = (new_unfolded + 6) % 6
			
		unfold_elements(new_unfolded)
		
	else:
		var new_active = 0
		if event.is_action_pressed("ui_down"):
			new_active += 1
			
			activate_element(new_active)
	
		if event.is_action_pressed("ui_up"):
			new_active -= 1
			activate_element(new_active)
	
	
		
	if event.is_action_pressed("ui_accept"):
		if unfolded_elements == 0:
			unfold_elements(5)
			is_in_list_mode = true
		else:
			unfold_elements(0)
			is_in_list_mode = false
			
func activate_element(diff):
	
	$buttons.get_child(active_element).hide_box()

	active_element += diff
	active_element = (active_element + 6) % 6
	
	is_animating = true
	
	for i in $buttons.get_child_count():
		var child = $buttons.get_child(i)
		
		$Tween.interpolate_property(child, 'rect_rotation', child.rect_rotation, child.rect_rotation - diff * 60 , duration, Tween.TRANS_LINEAR, Tween.EASE_OUT)
	$Tween.start()
	
	yield($Tween, "tween_all_completed")
	
		
	for i in $buttons.get_child_count():
		var child = $buttons.get_child(i)
		child.rect_rotation = float(int(child.rect_rotation) % 360)
	
	
	$buttons.get_child(active_element).show_box()
	
	is_animating = false
	
func unfold_elements(amount):
	if unfolded_elements == amount:
		return
	
	is_animating = true
	
	if !is_in_list_mode:
		var dist_sign = sign(2.5-active_element)
		for i in $buttons.get_child_count():
			var child = $buttons.get_child(i)
			
			var target_angle = 60 * i
			var dist = abs(target_angle - child.rect_rotation)
			dist = int(dist) % 360
			dist = 180 - abs(dist - 180)
				
			$Tween.interpolate_property(child, 'rect_rotation', child.rect_rotation, child.rect_rotation + dist * dist_sign, dist / 60 * duration , Tween.TRANS_CUBIC, Tween.EASE_OUT)
			child.hide_box()
		active_element = 0
		
		$Tween.start()
		yield($Tween, "tween_all_completed")
		for i in $buttons.get_child_count():
			var child = $buttons.get_child(i)
			child.rect_rotation = i * 60
		


	for i in $buttons.get_child_count():
		var child = $buttons.get_child(i)
		if i > amount:
			
			$Tween.interpolate_property(child, 'rect_rotation', child.rect_rotation, (i - amount) * 60 , duration, Tween.TRANS_LINEAR, Tween.EASE_OUT)
			$Tween.interpolate_property(child, 'rect_position', child.rect_position, Vector2(0, amount * 130), duration, Tween.TRANS_LINEAR, Tween.EASE_OUT)
			child.hide_box()
			continue
		
		var delay = 0
		if abs(amount - unfolded_elements) > 1:
			delay = duration * i / 4
		
		child.show_box(delay * 2)
		
		$Tween.interpolate_property(child, 'rect_rotation', child.rect_rotation, 0, duration, Tween.TRANS_LINEAR, Tween.EASE_OUT, delay)
		$Tween.interpolate_property(child, 'rect_position', child.rect_position, Vector2(0, i * 130), duration, Tween.TRANS_LINEAR, Tween.EASE_OUT, delay)
	$Tween.start()
	
	yield($Tween, "tween_all_completed")
	
	for i in $buttons.get_child_count():
		var child = $buttons.get_child(i)
		child.rect_rotation = float(int(child.rect_rotation) % 360)
	
	unfolded_elements = amount
	is_animating = false

	
	
	
