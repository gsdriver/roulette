# Roulette Wheel
Alexa skill that allows you to play a game of roulette.
This game allows you to play a game of Roulette using several different types of bets
and with either an American (double zero) or European (single zero) wheel.
You can place bets via the following voice commands:

* `bet on black/red` - Places a bet on either the black or red numbers of the wheel, pays 1:1
* `bet on even/odd` - Places a bet on the even or odd numbers of the wheel (does not include zeroes), pays 1:1
* `bet on high/low` - Places a bet on the high (19-36) or low (1-18) numbers of the wheel, pays 1:1
* `bet on first column` - Places a bet on the first, second, or third column of numbers, pays 2:1
* `bet on second dozen` - Places a bet on the first (1-12), second (13-24),or third (25-36) dozen numbers, pays 2:1

In addition, you can bet on a set of interior numbers in several ways:

* `bet on (single number)` - Places a bet on a single number of the wheel, pays 35:1
* `bet on (two numbers)` - Places a split bet on two adjecent numbers, where you win if the ball
      lands on either number, pays 17:1
* `bet on (three numbers)` - Places a street bet on a row of numbers of the wheel (e.g. 7, 8, 9).
      You win if the ball lands on any of the three numbers, pays 11:1
* `bet on (four numbers)` - Places a corner bet on four adjacent numbers of the wheel
      (e.g. 10, 11, 13, 14). You win if the ball lands on any of these numbers, pays 8:1
* `bet on (sixn numbers)` - Places a double street bet on two adjacent rows of numbers
      (e.g. 19, 20, 21, 22, 23, 24). You win if the ball lands on any of these numbers, pays 5:1

When placing your bet, you can specify an amount `bet 5 units on red`. If no amount is specified,
then the last amount bet will be used, otherwise 1 unit will be used for your first bet.

After you've placed your bets, you can say `spin the wheel` to spin the wheel. A random number from
1-36, zero, or double zero will be called and bets will be paid accordingly. Note that after the
first round, before placing any new bets, you can spin the wheel again to use the same set of bets
as the previous round.

The game also supports American (double zero) and European (single wheel) variants. To change, just
say `change to a European wheel` (or American wheel). All previously placed bets are cleared when
changing to a different wheel type.

At any time, you can ask for help. You will be told how many units you have left, what type of wheel
you are playing with, and will be given a few example bets that you can place, or told whether you can
spin the wheel if you have placed bets.

Please feel free to reach out to me and let me know if you enjoy this game or encounter any issues!