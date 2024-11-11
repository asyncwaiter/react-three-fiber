// server/app.ts

import { Server, Socket } from "socket.io";

const io = new Server({ cors: { origin: "http://localhost:5173" } });

type Position = [number, number, number];
type Directions = {
  up?: boolean;
  down?: boolean;
  left?: boolean;
  right?: boolean;
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
  hasTail: boolean;
  jump?: boolean;
  angleRad?: number; // 라디안 값의 각도 저장
  shift?: boolean;
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

const handleCatch = (character: Character) => {
  characters.forEach((otherCharacter) => {
    if (character.id !== otherCharacter.id && otherCharacter.hasTail) {
      const dx = character.position[0] - otherCharacter.position[0];
      const dz = character.position[2] - otherCharacter.position[2];
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance <= TAIL_STEAL_DISTANCE) {
        character.hasTail = true;
        otherCharacter.hasTail = false;
        console.log(
          `${character.id} has stolen the tail from ${otherCharacter.id}`
        );
      }
    }
  });
};

io.listen(3001);
const characters: Character[] = [];
const existingPositions: Position[] = [];
const CHARACTER_SIZE = 2;
const TAIL_STEAL_DISTANCE = 5;

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
    // bodyColor: generateRandomHexColor(),
    // hairColor: generateRandomHexColor(),
    // bellyColor: generateRandomHexColor(),
    bodyColor: "#FFFFFF",
    hairColor: "#FFFFFF",
    bellyColor: "#FFFFFF",
    velocity: [0, 0, 0], // [x, y, z]
    acceleration: [0, 0, 0],
    isOnGround: true,
    directions: {
      up: false,
      down: false,
      left: false,
      right: false,
    },
    hasTail: characters.length % 2 === 0,
    shift: false,
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
  socket.on("jump", (jump: boolean) => {
    const character = characters.find((char) => char.id === socket.id);
    if (character) {
      character.jump = jump;
    }
  });

  socket.on("angle", (angleRad: number) => {
    const character = characters.find((char) => char.id === socket.id);
    if (character) {
      character.angleRad = angleRad;
    }
  });

  socket.on("shift", (shift: boolean) => {
    const character = characters.find((char) => char.id === socket.id);
    if (character) {
      character.shift = shift;
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
    // 라디안 값의 각도를 사용
    const angleRad = character.angleRad || 0;

    // 전진 및 우측 벡터 계산 (Y축 회전 기준)
    const forwardX = -Math.sin(angleRad);
    const forwardZ = -Math.cos(angleRad);
    const rightX = Math.cos(angleRad);
    const rightZ = -Math.sin(angleRad);
    if (directions.up) {
      character.acceleration[0] += forwardX * ACCELERATION_AMOUNT;
      character.acceleration[2] += forwardZ * ACCELERATION_AMOUNT;
    }
    if (directions.down) {
      character.acceleration[0] -= forwardX * ACCELERATION_AMOUNT;
      character.acceleration[2] -= forwardZ * ACCELERATION_AMOUNT;
    }
    if (directions.left) {
      character.acceleration[0] -= rightX * ACCELERATION_AMOUNT;
      character.acceleration[2] -= rightZ * ACCELERATION_AMOUNT;
    }
    if (directions.right) {
      character.acceleration[0] += rightX * ACCELERATION_AMOUNT;
      character.acceleration[2] += rightZ * ACCELERATION_AMOUNT;
    }
    // 속도 업데이트
    character.velocity[0] += character.acceleration[0];
    character.velocity[2] += character.acceleration[2];

    // 마찰 적용
    character.velocity[0] *= FRICTION;
    character.velocity[2] *= FRICTION;

    // 속도 제한
    const speed = Math.sqrt(
      character.velocity[0] ** 2 + character.velocity[2] ** 2
    );
    if (speed > MAX_SPEED) {
      const scale = MAX_SPEED / speed;
      character.velocity[0] *= scale;
      character.velocity[2] *= scale;
    }

    // 위치 업데이트
    character.position[0] += character.velocity[0];
    character.position[2] += character.velocity[2];

    // 위치 양자화
    character.position[0] = quantize(character.position[0]);
    character.position[2] = quantize(character.position[2]);

    // 꼬리 잡기 로직
    if (character.shift) {
      handleCatch(character);
    }

    // 충돌 처리
    handleCollision(character);

    if (character.hasTail) {
      character.bodyColor = "#888888";
      character.hairColor = "#888888";
      character.bellyColor = "#888888";
    }
    if (!character.hasTail) {
      character.bodyColor = "#FFFFFF";
      character.hairColor = "#FFFFFF";
      character.bellyColor = "#FFFFFF";
    }
  });

  // 클라이언트로 캐릭터 상태 전송
  io.emit("characters", characters);
}, UPDATE_INTERVAL);
