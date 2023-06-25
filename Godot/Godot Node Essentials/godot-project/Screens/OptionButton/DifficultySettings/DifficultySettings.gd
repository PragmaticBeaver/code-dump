extends Control

onready var _label_animation_player: AnimationPlayer = $enemy/EnemyStatsLabel/AnimationPlayer
onready var _difficulty_button: OptionButton = $MainRect/VBoxContainer/DifficultyButton
onready var _animation_player: AnimationPlayer = $MainRect/AnimationPlayer
onready var _enemy_stats_label: Label = $enemy/EnemyStatsLabel


func _ready() -> void:
	#ANCHOR:signal
	_difficulty_button.connect("item_selected", self, "update_difficulty")
	#END:signal
	update_difficulty(_difficulty_button.selected)

#ANCHOR:difficulty
func update_difficulty(index: int) -> void:
	var difficulty_text: String = _difficulty_button.get_item_text(index)
	match difficulty_text:
		"Easy":
			_enemy_stats_label.text = "x1"
			_enemy_stats_label.modulate = Color.white
		"Medium":
			_enemy_stats_label.text = "x2"
			_enemy_stats_label.modulate = Color.tomato
		"Hard":
			_enemy_stats_label.text = "x4"
			_enemy_stats_label.modulate = Color.red
		_:
			push_error("Unexpected difficulty mode")
#END:difficulty
	_label_animation_player.play("show_stats")
	_animation_player.play("select")
