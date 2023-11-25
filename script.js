const MAP_WIDTH = 40;
const MAP_HEIGHT = 24;
const MAX_ROOMS = 10;
const MIN_ROOM_SIZE = 3;
const MAX_ROOM_SIZE = 8;
const MIN_PASSAGES = 3;
const MAX_PASSAGES = 5;

const field = document.querySelector('.field');
const enemies = [];
const tiles = [];
const characters = {
    hero: { x: 0, y: 0, health: 100 }
};
const adjacentCells = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 }
];
const map = generateMap();

placeItemsAndCharsOnMap(map, 'sword', 2);
placeItemsAndCharsOnMap(map, 'healthPotion', 10);
placeItemsAndCharsOnMap(map, 'enemy', 10);
placeItemsAndCharsOnMap(map, 'hero', 1);

drawMap(map);

function placeItemsAndCharsOnMap(map, itemType, itemCount) {
    for (let i = 0; i < itemCount; i++) {

        const { x, y } = getRandomEmptyTile(map);

        map[y][x] = itemType;

        if (itemType === 'enemy') {
            enemies.push({ x, y, health: 100 });
        } else if (itemType === 'hero') {
            characters.hero.x = x;
            characters.hero.y = y;
            characters.hero.health = 100;
        }
    }
}

function getRandomEmptyTile(map) {

    const availableTiles = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (map[y][x] === 'floor') {
                availableTiles.push({ x, y });
            }
        }
    }
    if (availableTiles.length === 0) {
        return null;
    }

    const randomIndex = Math.floor(Math.random() * availableTiles.length);
    return availableTiles[randomIndex];
}

function generateMap() {

    const map = Array.from({ length: MAP_HEIGHT }, () => Array(MAP_WIDTH).fill('wall'));

    for (let i = 0; i < MAX_ROOMS; i++) {

        const roomWidth = Math.floor(Math.random() * (MAX_ROOM_SIZE - MIN_ROOM_SIZE + 1)) + MIN_ROOM_SIZE;
        const roomHeight = Math.floor(Math.random() * (MAX_ROOM_SIZE - MIN_ROOM_SIZE + 1)) + MIN_ROOM_SIZE;
        const x = Math.floor(Math.random() * (MAP_WIDTH - roomWidth - 1)) + 1;
        const y = Math.floor(Math.random() * (MAP_HEIGHT - roomHeight - 1)) + 1;

        for (let j = y; j < y + roomHeight; j++) {
            for (let k = x; k < x + roomWidth; k++) {
                map[j][k] = 'floor';
            }
        }
    }
    generatePassages(map);
    return map;
}

function generatePassages(map) {

    const horizontalPassages = Math.floor(Math.random() * (MAX_PASSAGES - MIN_PASSAGES + 1)) + MIN_PASSAGES;
    const verticalPassages = Math.floor(Math.random() * (MAX_PASSAGES - MIN_PASSAGES + 1)) + MIN_PASSAGES;

    for (let i = 0; i < verticalPassages; i++) {
        const x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
        for (let j = 0; j < MAP_HEIGHT; j++) {
            map[j][x] = 'floor';
        }
    }

    for (let i = 0; i < horizontalPassages; i++) {
        const y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
        for (let j = 0; j < MAP_WIDTH; j++) {
            map[y][j] = 'floor';
        }
    }
}

function drawMap(map) {
    tiles.length = 0;
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');

            switch (map[y][x]) {
                case 'wall':
                    tile.classList.add('tileW');
                    break;
                case 'floor':
                    tile.classList.add('tile');
                    break;
                case 'sword':
                    tile.classList.add('tileSW');
                    break;
                case 'healthPotion':
                    tile.classList.add('tileHP');
                    break;
                case 'hero':
                    tile.classList.add('tileP');
                    const heroHealth = document.createElement('div');
                    heroHealth.classList.add('health');
                    heroHealth.style.width = `${characters.hero.health}%`;
                    tile.appendChild(heroHealth);
                    break;
                case 'enemy':
                    tile.classList.add('tileE');
                    const enemy = enemies.find(enemy => enemy.x === x && enemy.y === y);
                    if (enemy) {
                        const enemyHealth = document.createElement('div');
                        enemyHealth.classList.add('health');
                        enemyHealth.style.width = `${enemy.health}%`;
                        tile.appendChild(enemyHealth);
                    }
                    break;
                default:
                    break;
            }

            tiles.push(tile);
        }
    }

    field.innerHTML = '';
    tiles.forEach(tile => {
        field.appendChild(tile);
    });

    document.addEventListener('keydown', handleKeyPress);
}



function getRandomDirection() {

    const directions = ['up', 'down', 'left', 'right'];
    return directions[Math.floor(Math.random() * directions.length)];
}

function moveEnemies(map) {
    for (const enemy of enemies) {

        const { x, y } = enemy;
        const randomDirection = getRandomDirection();
        let newX = x;
        let newY = y;

        switch (randomDirection) {
            case 'up':
                newY = Math.max(0, y - 1);
                break;
            case 'down':
                newY = Math.min(map.length - 1, y + 1);
                break;
            case 'left':
                newX = Math.max(0, x - 1);
                break;
            case 'right':
                newX = Math.min(map[0].length - 1, x + 1);
                break;
            default:
                break;
        }

        if (map[newY][newX] === 'floor') {
            map[y][x] = 'floor';
            enemy.x = newX;
            enemy.y = newY;
            map[newY][newX] = 'enemy';
        }
    }
}



function handleKeyPress(event) {

    const key = event.key.toLowerCase();
    const { x: heroX, y: heroY } = findHeroPosition(map);

    let newHeroX = heroX;
    let newHeroY = heroY;

    switch (key) {
        case 'w':
        case 'ц':
            newHeroY = Math.max(0, heroY - 1);
            break;
        case 's':
        case 'ы':
            newHeroY = Math.min(map.length - 1, heroY + 1);
            break;
        case 'a':
        case 'ф':
            newHeroX = Math.max(0, heroX - 1);
            break;
        case 'd':
        case 'в':
            newHeroX = Math.min(map[0].length - 1, heroX + 1);
            break;
        case ' ':
            attackEnemy(heroX, heroY);
            moveEnemies(map);
            break;
        default:
            break;
    }

    if (map[newHeroY][newHeroX] === 'floor') {

        moveCharacter(map, heroX, heroY, newHeroX, newHeroY);
        moveEnemies(map);

    } else if (map[newHeroY][newHeroX] === 'enemy') {

        attackHero();

    } else if (map[newHeroY][newHeroX] === 'healthPotion') {

        characters.hero.health += 20;
        characters.hero.health = Math.min(characters.hero.health, 100);
        map[newHeroY][newHeroX] = 'floor';

        moveCharacter(map, heroX, heroY, newHeroX, newHeroY);
        moveEnemies(map);

    } else if (map[newHeroY][newHeroX] === 'sword') {

        characters.hero.swordBuff = true;
        map[newHeroY][newHeroX] = 'floor';

        moveCharacter(map, heroX, heroY, newHeroX, newHeroY);
        moveEnemies(map);
    }

    drawMap(map);
}


function moveCharacter(map, oldX, oldY, newX, newY) {

    map[newY][newX] = 'hero';
    map[oldY][oldX] = 'floor';

    characters.hero.x = newX;
    characters.hero.y = newY;
}

function findHeroPosition(map) {
    return { x: characters.hero.x, y: characters.hero.y };
}

function checkForEnemyNearby(x, y) {
    return adjacentCells.some(cell => {

        const { x: offsetX, y: offsetY } = cell;
        const newX = x + offsetX;
        const newY = y + offsetY;

        return map[newY] && map[newY][newX] === 'enemy';
    });
}

function attackHero() {

    characters.hero.health -= 10;

    if(characters.hero.health === 0 ) {
        alert('Вы проиграли!');
        window.location.reload();
    }
}

function isInsideMap(x, y) {
    return x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT;
}

function attackEnemy(heroX, heroY) {

    const enemyNearby = checkForEnemyNearby(heroX, heroY);

    if (enemyNearby) {
        adjacentCells.forEach(cell => {

            const { x: offsetX, y: offsetY } = cell;
            const enemyX = heroX + offsetX;
            const enemyY = heroY + offsetY;

            if (isInsideMap(enemyX, enemyY) && map[enemyY][enemyX] === 'enemy') {
                const enemy = enemies.find(e => e.x === enemyX && e.y === enemyY);
                if (enemy) {
                    const damage = characters.hero.swordBuff ? 100 : 50;
                    enemy.health -= damage;
                    if (enemy.health <= 0) {
                        map[enemyY][enemyX] = 'floor';
                        enemies.splice(enemies.indexOf(enemy), 1);
                        if (enemies.length === 0) {
                            alert('Вы победили!');
                            window.location.reload();
                        }
                    }
                }
            }
        });
    }
}



document.addEventListener('keydown', handleKeyPress);
