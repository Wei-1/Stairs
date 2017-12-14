# Stairs - Mini Game

Stairs is a mini game that you will need to control the Player (Yellow Box) to not die.

<https://wei-1.github.io/Stairs/>

## Rule

- Player will gain 1 hp while stepping on a stair.

- Player will lose 4 hp if stepping on a red stair or hit the ceiling.

- Player will die when hp becomes 0 or fall down.

## Stairs

Stairs are 10x80 rectangles.

All stairs will go 5px up every round.

1. Blue stair - code 0 : standard stair

2. Red stair - code 1 : demage stair

3. Green stair - code 2: jump stair

## Player

Player can step on stairs.

Player is a 30x20 rectangle.

Player will gain 1 fallspeed is not standing on a stair every round.

## Score

Score = floor(Round / 30)

## How to Play?

Modify the code in the textarea.

Click GO.