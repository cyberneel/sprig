/*
First time? Check out the tutorial game:
https://sprig.hackclub.com/gallery/getting_started

@title: Dodgy Day
@author: Neelesh Chevuri
@tags: []
@addedOn: 2024-00-00
*/

const player = "p"
const vBomb = "b"
const hBomb = "h"
const heart = "e"
const tBomb = 't'

setLegend(
  [player, bitmap`
......0000......
.....000000.....
.....000000.....
.....000000.....
.....000000.....
......0000......
.......00.......
.....000000.....
....0.0000.0....
....0.0000.0....
......0000......
......0000......
......0..0......
......0..0......
......0..0......
......0..0......`],
  [vBomb, bitmap`
................
................
.....333333.....
...3333333333...
...3333333333...
..333333333333..
..333333333333..
..333333333333..
..333333333333..
..333333333333..
..333333333333..
...3333333333...
...3333333333...
.....333333.....
................
................`],
  [hBomb, bitmap`
................
................
.....HHHHHH.....
...HHHHHHHHHH...
...HHHHHHHHHH...
..HHHHHHHHHHHH..
..HHHHHHHHHHHH..
..HHHHHHHHHHHH..
..HHHHHHHHHHHH..
..HHHHHHHHHHHH..
..HHHHHHHHHHHH..
...HHHHHHHHHH...
...HHHHHHHHHH...
.....HHHHHH.....
................
................`],
  [heart, bitmap`
...........99...
..99......9999..
.99999...99999..
.999999.9999999.
.99999999999999.
.99999999999999.
.99999999999999.
.99999999999999.
.99999999999999.
.9999999999999..
..999999999999..
...9999999999...
....99999999....
......99999.....
........99......
................`],
  [tBomb, bitmap`
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL`]
)

setSolids([])

let level = 0

var timeSecs = 0;
var health = 3;

const levels = [
  map`
eee..........h.
..........b....
...............
...............
...............
...............
...............
h..............
...............
...............
......b......p.
...............`
]

setMap(levels[level])

setPushables({
  [player]: []
})

// Movement Input
onInput("s", () => {
  getFirst(player).y += 1
})

onInput("w", () => {
  getFirst(player).y -= 1
})

onInput("a", () => {
  getFirst(player).x -= 1
})

onInput("d", () => {
  getFirst(player).x += 1
})

afterInput(() => {

})

// Random Number Gen
function getRndInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomInt(max) {
  const typedArray = new Uint32Array(1);
  crypto.getRandomValues(typedArray);
  const res = typedArray % (max+1); 

  return res;
}

// player died
function PlayerOver() {
  playerObj.remove();
  addText("GAME OVER\nScore: " + timeSecs, {
    x: 5,
    y: 12,
    color: color`5`
  });
  // gameOver = true;
  clearInterval(gameInterval);
  clearInterval(bombInterval);
  clearInterval(timeInterval);
}

// Spawn bomb
function SpawnBombOld(type) {
  if (type === vBomb) {
    //addSprite(getRndInt(0, width() - 1), 0, type);
    addSprite(playerObj.x + getRndInt(-1,1), 0, type);
  } else if (type === hBomb) {
    //addSprite(0, getRndInt(0, height() - 1), type);
    addSprite(0, playerObj.y + getRndInt(-1,1), type);
  }
}

// New Spawn Logic
function SpawnBombNew(type) {
  if (type === vBomb) {
    let x = playerObj.x + getRandomInt(2)-1//getRndInt(-1,1);
    if (x < 0)
      x = 0;
    if (x > width()-1)
      x = width()-1;
    addSprite(x, 0, tBomb);
  } else if (type === hBomb) {
    let y = playerObj.y + getRandomInt(2)-1//getRndInt(-1,1);
    if (y < 0)
      y = 0;
    if (y > height()-1)
      y = height()-1;
    addSprite(0, y, tBomb);
  }
}

// Bomb Logic New
function BombLogicNew() {
  var vBombSprites = getAll(vBomb);
  var hBombSprites = getAll(hBomb);
  var tBombSprites = getAll(tBomb);


  // temp bombs
  tBombSprites.forEach(tBSprite => {
    let x = tBSprite.x;
    let y = tBSprite.y;

    let typ = hBomb;
    if (y == 0)
      typ = vBomb;
    
    tBSprite.remove();
    addSprite(x,y,typ);
  });
  
  // vertical bombs
  vBombSprites.forEach(vBSprite => {
    if (vBSprite.y == height() - 1) {
      // Spawn New Bomb
      SpawnBombNew(vBomb);
      vBSprite.remove()
      IncreaseSpeed();
    }
    vBSprite.y += 1;
  });

  // Horizontal bombs
  hBombSprites.forEach(hBSprite => {
    if (hBSprite.x == width() - 1) {
      // Spawn New Bomb
      SpawnBombNew(hBomb);
      hBSprite.remove();
      IncreaseSpeed();
    }
    hBSprite.x += 1
  });
}


// Increase speed
function IncreaseSpeed() {
  clearInterval(bombInterval);
  let bombDelay = 800 - timeSecs * 20;
  if (bombDelay < 300)
    bombDelay = 300;
  bombInterval = setInterval(BombLogicNew, bombDelay);
}

var hit = false;
// Main Game Loop
const playerObj = getFirst(player);

function GameLoop() {
  var playerTile = getTile(playerObj.x, playerObj.y);
  // loop through the sprites at the tile
  if (playerTile.length < 2) {
    hit = false;
  }
  if (!hit) {
    playerTile.forEach(sprite => {
      if (sprite.type === vBomb || sprite.type === hBomb) {
        hit = true;
        health--;
        if (health == 2) {
          getAll(heart)[0].remove();
        } else if (health == 1) {
          getAll(heart)[0].remove();
        } else if (health <= 0) {
          getAll(heart)[0].remove();
          PlayerOver();
        }
      }
    });
  }
}

// Time increase, used for difficulty later
function UpdateTime() {
  timeSecs++;
}

// Run the logic loops periodically

const gameInterval = setInterval(GameLoop, 100);

var bombInterval = setInterval(BombLogicNew, 800);

const timeInterval = setInterval(UpdateTime, 1000);