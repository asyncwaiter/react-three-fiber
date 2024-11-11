import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { atom, useAtom } from "jotai";

export const socket = io("http://localhost:3001");
export const charactersAtom = atom([]);

export const SocketManager = () => {
  const [_characters, setCharacters] = useAtom(charactersAtom);
  const keysPressed = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    jump: false,
  });

  useEffect(() => {
    function onConnect() {
      console.log("connected");
    }
    function onDisconnect() {
      console.log("disconnected");
    }
    function onHello() {
      console.log("hello");
    }
    function onCharacters(value) {
      setCharacters(value);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("hello", onHello);
    socket.on("characters", onCharacters);

    const handleKeyDown = (event) => {
      if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
        if (!keysPressed.current.shift) {
          keysPressed.current.shift = true;
          socket.emit("shift", true);
          console.log("shift: true");
        }
      }
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          " ",
          "Space",
        ].includes(event.code)
      ) {
        event.preventDefault();
        let keyChanged = false;
        switch (event.key) {
          case "ArrowUp":
            if (!keysPressed.current.up) {
              keysPressed.current.up = true;
              keyChanged = true;
            }
            break;
          case "ArrowDown":
            if (!keysPressed.current.down) {
              keysPressed.current.down = true;
              keyChanged = true;
            }
            break;
          case "ArrowLeft":
            if (!keysPressed.current.left) {
              keysPressed.current.left = true;
              keyChanged = true;
            }
            break;
          case "ArrowRight":
            if (!keysPressed.current.right) {
              keysPressed.current.right = true;
              keyChanged = true;
            }
            break;
          case " ":
          case "Space":
            if (!keysPressed.current.jump) {
              keysPressed.current.jump = true;
              keyChanged = true;
            }
          default:
            break;
        }
        if (keyChanged) {
          socket.emit("move", keysPressed.current);
          console.log("Emitted move:", keysPressed.current);
        }
      }
    };

    const handleKeyUp = (event) => {
      if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
        if (keysPressed.current.shift) {
          keysPressed.current.shift = false;
          socket.emit("shift", false);
          console.log("shift: false");
        }
      }
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          " ",
          "Space",
        ].includes(event.code)
      ) {
        event.preventDefault();
        let keyChanged = false;
        switch (event.key) {
          case "ArrowUp":
            if (keysPressed.current.up) {
              keysPressed.current.up = false;
              keyChanged = true;
            }
            break;
          case "ArrowDown":
            if (keysPressed.current.down) {
              keysPressed.current.down = false;
              keyChanged = true;
            }
            break;
          case "ArrowLeft":
            if (keysPressed.current.left) {
              keysPressed.current.left = false;
              keyChanged = true;
            }
            break;
          case "ArrowRight":
            if (keysPressed.current.right) {
              keysPressed.current.right = false;
              keyChanged = true;
            }
            break;
          case " ":
          case "Space":
            if (keysPressed.current.jump) {
              keysPressed.current.jump = false;
              keyChanged = true;
            }
            break;
          default:
            break;
        }
        if (keyChanged) {
          socket.emit("move", keysPressed.current);
          console.log("Emitted move:", keysPressed.current);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("hello", onHello);
      socket.off("characters", onCharacters);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);
};

// export const SocketManager = () => {
//   const [_characters, setCharacters] = useAtom(charactersAtom);
//   const keysPressed = useRef({
//     up: false,
//     down: false,
//     left: false,
//     right: false,
//   });
//   const animationFrameId = useRef(null);

//   useEffect(() => {
//     function onConnect() {
//       console.log("connected");
//     }
//     function onDisconnect() {
//       console.log("disconnected");
//     }
//     function onHello() {
//       console.log("hello");
//     }
//     function onCharacters(value) {
//       setCharacters(value);
//     }

//     socket.on("connect", onConnect);
//     socket.on("disconnect", onDisconnect);
//     socket.on("hello", onHello);
//     socket.on("characters", onCharacters);

//     const moveCharacter = () => {
//       let direction = null;
//       if (keysPressed.current["ArrowUp"]) direction = "up";
//       if (keysPressed.current["ArrowDown"]) direction = "down";
//       if (keysPressed.current["ArrowLeft"]) direction = "left";
//       if (keysPressed.current["ArrowRight"]) direction = "right";

//       if (direction) socket.emit("move", { direction });
//       animationFrameId.current = requestAnimationFrame(moveCharacter);
//     };

//     const handleKeyDown = (event) => {
//       keysPressed.current[event.key] = true;
//       if (!animationFrameId.current)
//         animationFrameId.current = requestAnimationFrame(moveCharacter);
//     };

//     const handleKeyUp = (event) => {
//       keysPressed.current[event.key] = false;
//       if (!Object.values(keysPressed.current).some((pressed) => pressed)) {
//         cancelAnimationFrame(animationFrameId.current);
//         animationFrameId.current = null;
//         socket.emit("move", { direction: null });
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     window.addEventListener("keyup", handleKeyUp);

//     return () => {
//       socket.off("connect", onConnect);
//       socket.off("disconnect", onDisconnect);
//       socket.off("hello", onHello);
//       socket.off("characters", onCharacters);
//       window.removeEventListener("keydown", handleKeyDown);
//       window.removeEventListener("keyup", handleKeyUp);
//       if (animationFrameId.current)
//         cancelAnimationFrame(animationFrameId.current);
//     };
//   }, []);
// };
