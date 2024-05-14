import copy
import random
import time

WIDTH = 50
HEIGHT = 20
LIFE_SYMBOL = "#"
EMPTY_SYMBOL = " "


def create_random_game_field(width, height):
    game_field = []
    for x in range(width):
        column = []
        for y in range(height):
            has_life = random.randint(0, 1) == 0
            if has_life:
                column.append(LIFE_SYMBOL)
            else:
                column.append(EMPTY_SYMBOL)
        game_field.append(column)
    return game_field


def print_game_field(game_field, width, height):
    for y in range(height):
        for x in range(width):
            print(game_field[x][y], end="")
        print()


def run():
    game_width = WIDTH
    game_height = HEIGHT
    next_cells = create_random_game_field(game_width, game_height)

    while True:
        print("\n\n\n\n\n")
        current_cells = copy.deepcopy(next_cells)
        print_game_field(current_cells, game_width, game_height)

        for x in range(game_width):
            for y in range(game_height):
                left_coord = (x - 1) % game_width
                right_coord = (x + 1) % game_width
                above_coord = (y - 1) % game_height
                below_coord = (y + 1) % game_height

                neighbors_count = 0
                if current_cells[left_coord][above_coord] == LIFE_SYMBOL:
                    neighbors_count += 1
                if current_cells[x][above_coord] == LIFE_SYMBOL:
                    neighbors_count += 1
                if current_cells[right_coord][above_coord] == LIFE_SYMBOL:
                    neighbors_count += 1
                if current_cells[left_coord][y] == LIFE_SYMBOL:
                    neighbors_count += 1
                if current_cells[right_coord][y] == LIFE_SYMBOL:
                    neighbors_count += 1
                if current_cells[left_coord][below_coord] == LIFE_SYMBOL:
                    neighbors_count += 1
                if current_cells[x][below_coord] == LIFE_SYMBOL:
                    neighbors_count += 1
                if current_cells[right_coord][below_coord] == LIFE_SYMBOL:
                    neighbors_count += 1

                if current_cells[x][y] == LIFE_SYMBOL and (neighbors_count == 2 or neighbors_count == 3):
                    next_cells[x][y] = LIFE_SYMBOL  # alive cell with 2 or 3 neighbors will live on
                elif current_cells[x][y] == EMPTY_SYMBOL and neighbors_count == 3:
                    next_cells[x][y] = LIFE_SYMBOL  # dead cell with 3 neighbors will resurrect
                else:
                    next_cells[x][y] = EMPTY_SYMBOL
        time.sleep(1)


run()
