import {
  ContactShadows,
  Environment,
  OrbitControls,
  useCursor,
} from "@react-three/drei";
import React, { useEffect, useState } from "react";
import AnimatedRobot from "./AnimatedRobot";
import { useAtom } from "jotai";
import { charactersAtom } from "./SocketManager";
import * as THREE from "three";

export const Experience = React.memo(() => {
  const [onFloor, setOnFloor] = useState(false);
  useCursor(onFloor);
  const [characters] = useAtom(charactersAtom);

  return (
    <>
      <Environment preset="sunset" />
      <ambientLight intensity={0.3} />
      {/* <ContactShadows blur={3} /> */}
      <OrbitControls />
      <mesh
        rotation-x={-Math.PI / 2}
        position-y={-0.001}
        onPointerEnter={() => setOnFloor(true)}
        onPointerLeave={() => setOnFloor(false)}
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="plum" />
      </mesh>
      {characters.map((c) => (
        <AnimatedRobot
          key={c.id}
          hairColor={c.hairColor}
          bodyColor={c.bodyColor}
          bellyColor={c.bellyColor}
          posX={c.position[0]}
          posY={c.position[1]}
          posZ={c.position[2]}
          // position={new THREE.Vector3(c.position[0], 0, c.position[2])}
        />
      ))}
    </>
  );
});
