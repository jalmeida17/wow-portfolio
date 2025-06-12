import { useEffect, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

function GnomeBotModel({ scene }) {
  const mixerRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const animationFrameRef = useRef(null);
  const modelRef = useRef(null);
  
  useEffect(() => {
    if (!scene) return;
    
    const loader = new GLTFLoader();
    loader.load(
      'glTF-models/gnomebot2/gnomebot2_rusty102,201.gltf',
      (gltf) => {
        const animations = gltf.animations;
        const gnomeBotModel = gltf.scene;
        modelRef.current = gnomeBotModel;
        
        gnomeBotModel.traverse((child) => {
          if (child.isMesh) {
            child.name = child.name || 'BronzebeardMesh';
          }
        });
        
        const mixer = new THREE.AnimationMixer(gnomeBotModel);
        mixerRef.current = mixer;
        gnomeBotModel.position.set(-525, 9.8, 355); 
        gnomeBotModel.rotation.set(0, Math.PI / 0.8, 0);
        gnomeBotModel.scale.set(2, 2, 2);
        scene.add(gnomeBotModel);

        console.log('Available animations:', animations.map(a => a.name));

        // Select a single animation to play continuously
        const animationName = 'Stand (ID 0 variation 0)'; // Using Stand2 animation
        const clip = THREE.AnimationClip.findByName(animations, animationName);
        
        if (clip) {
          const action = mixer.clipAction(clip);
          // Configure the animation to loop continuously
          action.clampWhenFinished = false;
          action.loop = THREE.LoopRepeat;
          
          // Play the animation immediately
          action.reset();
          action.play();
        } else {
          console.warn(`Animation ${animationName} not found`);
        }
        
        animate();
      },
      undefined,
      (error) => {
        console.error('An error happened while loading gnomebot:', error);
      }
    );
    
    const animate = () => {
      const delta = clockRef.current.getDelta();
      
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, [scene]);
  
  return null;
}

export default GnomeBotModel;