/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.2 public/models/Guri.glb -o src/components/Guri.jsx -r public 
*/

import React from 'react';
import { useGLTF } from '@react-three/drei';

export default function Guri(props) {
  const { nodes, materials } = useGLTF('/models/Guri.glb');
  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.group1868352797.geometry}
        material={materials.mat21}
      />
      <mesh
        geometry={nodes.mesh2089373109.geometry}
        material={materials.mat21}
      />
      <mesh
        geometry={nodes.mesh2089373109_1.geometry}
        material={materials.mat23}
      />
      <mesh
        geometry={nodes.mesh1518070955.geometry}
        material={materials.mat13}
      />
      <mesh
        geometry={nodes.mesh1518070955_1.geometry}
        material={materials.mat18}
      />
      <mesh
        geometry={nodes.mesh1518070955_2.geometry}
        material={materials.mat21}
      />
      <mesh
        geometry={nodes.mesh1156846795.geometry}
        material={materials.mat21}
      />
      <mesh
        geometry={nodes.mesh1156846795_1.geometry}
        material={materials.mat11}
      />
      <mesh
        geometry={nodes.mesh1156846795_2.geometry}
        material={materials.mat23}
      />
      <mesh
        geometry={nodes.mesh705226761.geometry}
        material={materials.mat23}
      />
      <mesh
        geometry={nodes.mesh705226761_1.geometry}
        material={materials.mat21}
      />
      <mesh
        geometry={nodes.mesh705226761_2.geometry}
        material={materials.mat11}
      />
    </group>
  );
}

useGLTF.preload('/models/Guri.glb');