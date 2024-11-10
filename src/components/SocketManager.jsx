import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { atom, useAtom } from 'jotai';

export const socket = io('http://localhost:3001');
export const charactersAtom = atom([]);

export const SocketManager = () => {
  const [_characters, setCharacters] = useAtom(charactersAtom);
  const keysPressed = useRef({});
  const animationFrameId = useRef(null);

  useEffect(() => {
    function onConnect() {
      console.log('connected');
    }
    function onDisconnect() {
      console.log('disconnected');
    }
    function onHello() {
      console.log('hello');
    }
    function onCharacters(value) {
      setCharacters(value);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('hello', onHello);
    socket.on('characters', onCharacters);

    const moveCharacter = () => {
      let direction = null;
      if (keysPressed.current['ArrowUp']) direction = 'up';
      if (keysPressed.current['ArrowDown']) direction = 'down';
      if (keysPressed.current['ArrowLeft']) direction = 'left';
      if (keysPressed.current['ArrowRight']) direction = 'right';

      if (direction) socket.emit('move', { direction });
      animationFrameId.current = requestAnimationFrame(moveCharacter);
    };

    const handleKeyDown = (event) => {
      keysPressed.current[event.key] = true;
      if (!animationFrameId.current)
        animationFrameId.current = requestAnimationFrame(moveCharacter);
    };

    const handleKeyUp = (event) => {
      keysPressed.current[event.key] = false;
      if (!Object.values(keysPressed.current).some((pressed) => pressed)) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
        socket.emit('move', { direction: null });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('hello', onHello);
      socket.off('characters', onCharacters);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
    };
  }, []);
};
