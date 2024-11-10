import { Canvas } from '@react-three/fiber';
import { Experience } from './components/Experience';
import { SocketManager } from './components/SocketManager';

function App() {
  return (
    <>
      <SocketManager />
      <Canvas shadows camera={{ position: [15, 15, 15], fov: 50 }}>
        <color attach="background" args={['#ececec']} />
        <Experience />
      </Canvas>
    </>
  );
}

export default App;
