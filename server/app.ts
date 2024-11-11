// server/app.ts

import { Server, Socket } from "socket.io";

const io = new Server({ cors: { origin: "http://localhost:5173" } });

type Position = [number, number, number];
type Directions = {
  up?: boolean;
  down?: boolean;
  left?: boolean;
  right?: boolean;
  jump?: boolean;
};
type Character = {
  id: string;
  position: Position;
  bodyColor: string;
  hairColor: string;
  bellyColor: string;
  velocity: Position;
  acceleration: Position;
  isOnGround: boolean;
  directions: Directions; // 추가
};

function quantize(value: number, unit: number = 0.01): number {
  return Math.round(value / unit) * unit;
}

const generateRandomPosition = (
  existingPositions: Position[],
  minSize: number
): Position => {
  let position: Position;
  let isValid = false;
  do {
    position = [quantize(Math.random() * 10), 0, quantize(Math.random() * 10)];

    isValid = existingPositions.every((existingPosition) => {
      const distance = Math.sqrt(
        Math.pow(position[0] - existingPosition[0], 2) +
          Math.pow(position[2] - existingPosition[2], 2)
      );
      return distance >= minSize;
    });
  } while (!isValid);
  return position;
};

const generateRandomHexColor = (): string => {
  const color = Math.floor(Math.random() * 16777215).toString(16);
  return "#" + color.padStart(6, "0");
};

const handleCollision = (character: Character) => {
  characters.forEach((otherCharacter) => {
    if (character.id !== otherCharacter.id) {
      const dx = character.position[0] - otherCharacter.position[0];
      const dz = character.position[2] - otherCharacter.position[2];
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance < CHARACTER_SIZE) {
        const overlap = CHARACTER_SIZE - distance;
        const pushX = (dx / distance) * overlap * 0.5;
        const pushZ = (dz / distance) * overlap * 0.5;

        character.position[0] += pushX;
        character.position[2] += pushZ;
        otherCharacter.position[0] -= pushX;
        otherCharacter.position[2] -= pushZ;

        // 최소단위로 계산
        character.position[0] = quantize(character.position[0]);
        character.position[2] = quantize(character.position[2]);
        otherCharacter.position[0] = quantize(otherCharacter.position[0]);
        otherCharacter.position[2] = quantize(otherCharacter.position[2]);
      }
    }
  });
};

io.listen(3001);
const characters: Character[] = [];
const existingPositions: Position[] = [];
const CHARACTER_SIZE = 2;

// Define constants for acceleration, friction, and maximum speed
const FRICTION = 0.7; // Friction coefficient
const ACCELERATION_AMOUNT = 0.15; // Acceleration per input
const UPDATE_INTERVAL = 50; // Update interval in milliseconds
const MAX_SPEED = 0.3; // Maximum speed a character can have

io.on("connection", (socket: Socket) => {
  console.log("user connected");
  const newPosition = generateRandomPosition(existingPositions, CHARACTER_SIZE);
  existingPositions.push(newPosition);

  const newCharacter: Character = {
    id: socket.id,
    position: newPosition,
    bodyColor: generateRandomHexColor(),
    hairColor: generateRandomHexColor(),
    bellyColor: generateRandomHexColor(),
    velocity: [0, 0, 0], // [x, y, z]
    acceleration: [0, 0, 0],
    isOnGround: true,
    directions: {
      up: false,
      down: false,
      left: false,
      right: false,
      jump: false,
    },
  };
  characters.push(newCharacter);

  socket.emit("hello");
  io.emit("characters", characters);

  socket.on("move", (directions: any) => {
    const character = characters.find((char) => char.id === socket.id);
    if (character) {
      if (!directions || typeof directions !== "object") {
        console.warn("Invalid directions received:", directions);
        return;
      }

      character.directions = directions;
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");

    const index = characters.findIndex(
      (character) => character.id === socket.id
    );
    if (index !== -1) {
      characters.splice(index, 1);
      existingPositions.splice(index, 1);
    }
    io.emit("characters", characters);
  });
});

// Game update loop
setInterval(() => {
  characters.forEach((character) => {
    character.acceleration = [0, 0, 0];
    // Update velocity based on acceleration
    const directions = character.directions || {};
    if (directions.up) {
      character.acceleration[2] -= ACCELERATION_AMOUNT;
    }
    if (directions.down) {
      character.acceleration[2] += ACCELERATION_AMOUNT;
    }
    if (directions.left) {
      character.acceleration[0] -= ACCELERATION_AMOUNT;
    }
    if (directions.right) {
      character.acceleration[0] += ACCELERATION_AMOUNT;
    }
    // 속도 업데이트
    character.velocity[0] += character.acceleration[0];
    character.velocity[1] += character.acceleration[1];
    character.velocity[2] += character.acceleration[2];

    // Apply friction to simulate gradual slowing down
    character.velocity[0] *= FRICTION;
    character.velocity[2] *= FRICTION;

    // 수평 속도 제한
    const horizontalSpeed = Math.sqrt(
      character.velocity[0] ** 2 + character.velocity[2] ** 2
    );
    if (horizontalSpeed > MAX_SPEED) {
      const scale = MAX_SPEED / horizontalSpeed;
      character.velocity[0] *= scale;
      character.velocity[2] *= scale;
    }

    // 위치 업데이트
    character.position[0] += character.velocity[0];
    character.position[1] += character.velocity[1];
    character.position[2] += character.velocity[2];

    // 위치 양자화 (필요한 경우)
    character.position[0] = quantize(character.position[0]);
    character.position[1] = quantize(character.position[1]);
    character.position[2] = quantize(character.position[2]);

    // 충돌 처리
    handleCollision(character);
  });
  // Emit updated character positions to all clients
  io.emit("characters", characters);
}, UPDATE_INTERVAL);
