import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Canvas, extend, useThree } from '@react-three/fiber';
import { TextureLoader, Vector2 } from 'three';
import { Effects } from '@react-three/drei';
import { DotScreenPass } from 'three-stdlib';
import './index.scss';

// 1) Extend THREE with DotScreenPass so that <dotScreenPass ... /> works:
extend({ DotScreenPass });

function Plane({ texture }) {
  return (
    <mesh>
      <planeGeometry args={[10, 10]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

function EffectsComposer() {
  // 2) We can pass multiple passes to <Effects>.
  //    DotScreenPass can be given center, angle, scale as args:
  //    new DotScreenPass(Vector2(0.5,0.5), angle, scale)
  //
  //    attachArray="passes" is important if you have multiple passes.
  //    If you just have one pass, it’s optional but good practice.
  const { scene, camera } = useThree();
  return (
    <Effects
      multisampling={8}
      renderIndex={1}
      disableGamma={false}
      disableRenderPass={false}
      disableRender={false}
    >
      {/* Provide DotScreenPass constructor args: [ center, angle, scale ] */}
      <dotScreenPass
        attachArray="passes"
        args={[new Vector2(1, 1), 10.0, 10.0]}
      />
    </Effects>
  );
}

export default function App() {
  const [imageUrl, setImageUrl] = useState(null);

  // Load the dropped image as a texture
  const texture = useMemo(() => {
    if (!imageUrl) return null;
    return new TextureLoader().load(imageUrl);
  }, [imageUrl]);

  // Handle file drop
  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  }, []);

  // Register/unregister event listeners
  useEffect(() => {
    const preventDefaults = (e) => { e.preventDefault(); e.stopPropagation(); };
    window.addEventListener('dragover', preventDefaults);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', preventDefaults);
      window.removeEventListener('drop', handleDrop);
    };
  }, [handleDrop]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas>
        {texture && <Plane texture={texture} />}
        <EffectsComposer />
      </Canvas>
    </div>
  );
}
