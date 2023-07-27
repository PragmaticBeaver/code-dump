
from enum import Enum
import random


print("Welcome to this small game!")
print("Rock, Paper, or Scissors?")

class Choice(Enum):
    ROCK = "rock"
    PAPER = "papaer"
    SCISSORS = "scissors"


class WinLose:
    win = [Choice]
    lose = [Choice]

    def __init__(self, win, lose):
        self.win = win
        self.lose = lose

choices = {
    Choice.ROCK: WinLose(win=[Choice.SCISSORS], lose=[Choice.PAPER]),
    Choice.PAPER: WinLose(win=[Choice.ROCK], lose=[Choice.SCISSORS]),
    Choice.SCISSORS: WinLose(win=[Choice.PAPER], lose=[Choice.ROCK])
}

computer_pick, computer_winLose = random.choice(list(choices.items()))
user_input = input().upper().strip()
print("You: ", user_input)
print("PC: ", computer_pick)

if Choice[user_input] in computer_winLose.win:
    print("Computer won!")
elif Choice[user_input] in computer_winLose.lose:
    print("You win!")
else:
    print("It's a draw!")
