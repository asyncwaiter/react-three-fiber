/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.2 public/models/AnimatedPanda.glb -o src/components/AnimatedPanda.jsx -r public 
*/

import React, { useEffect, useState } from 'react';
import { useGraph } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';

export default function AnimatedPanda({ headBandColor = 'gold', ...props }) {
  const group = React.useRef();
  const { scene, animations } = useGLTF('/models/AnimatedPanda.glb');
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone);
  const { actions } = useAnimations(animations, group);
  const [animation, setAnimation] = useState(
    'CharacterArmature|CharacterArmature|CharacterArmature|Wave'
  );
  useEffect(() => {
    actions[animation].reset().fadeIn(0.5).play();
    return () => actions[animation].fadeOut(0.5);
  }, [animation]);

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Root_Scene">
        <group name="RootNode">
          <group
            name="CharacterArmature"
            rotation={[-Math.PI / 2, 0, 0]}
            scale={100}
          >
            <primitive object={nodes.Root} />
          </group>
          <skinnedMesh
            name="Headband"
            geometry={nodes.Headband.geometry}
            material={materials.AtlasMaterial}
            skeleton={nodes.Headband.skeleton}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={150}
          >
            <meshStandardMaterial color={headBandColor} />
          </skinnedMesh>
          <skinnedMesh
            name="Panda"
            geometry={nodes.Panda.geometry}
            material={materials.AtlasMaterial}
            skeleton={nodes.Panda.skeleton}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={150}
          />
        </group>
      </group>
    </group>
  );resp
}

useGLTF.preload('/models/AnimatedPanda.glb');
