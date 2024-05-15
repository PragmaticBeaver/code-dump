def combine_list_to_string(list):
    """
    - combine list to string
    - resulting string should be formated in the following way: '1, 2, 3, 4, 5, 6, 7, 8, 9 and 10'
    - empty lists shouldn't crash the program
    """

    if len(list) == 0:
        return
    text = ", ".join(list[:-1]) + " and " + list[-1]
    print(text)


# combine_list_to_string(["hello", "world", "how", "is", "it", "going?"])
# combine_list_to_string(["hello", "world"])
# combine_list_to_string([])


def coin_toss():
    """
    - flip a coin 100 times
    - find how often chains of 6 heads or 6 tails happen
    - H for heads or T for tails
    """

    HEAD = "H"
    TAIL = "T"

    def toss_coin(number_of_flips=100):
        import random

        coin_tosses = []

        for _ in range(number_of_flips):
            toss_result = random.choice([HEAD, TAIL])
            coin_tosses.append(toss_result)
        return coin_tosses

    def find_chains(coin_tosses):
        chains = []

        coin_value = ""
        coin_count = 0

        for i in range(len(coin_tosses)):
            coin = coin_tosses[i]

            if coin == coin_value:
                coin_count += 1
            elif coin != coin_value and coin_count > 1:
                chains.append({"coin_value": coin_value, "coin_count": coin_count})
                coin_count = 1
                coin_value = coin
            else:
                coin_count = 1
                coin_value = coin

            if i == len(coin_tosses):
                chains.append({"coin_value": coin_value, "coin_count": coin_count})

        return chains

    chains = find_chains(toss_coin())

    for chain in chains:
        if chain["coin_count"] >= 6:
            print(f"{chain['coin_value']} chain of {chain['coin_count']} in a row")


coin_toss()
