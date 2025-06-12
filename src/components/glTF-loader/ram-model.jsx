import { useEffect, useRef, useState } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

function RamModel({ scene }) {
  const mixerRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const animationFrameRef = useRef(null);
  const modelRef = useRef(null);
  const actionsRef = useRef({});
  const animationIntervalRef = useRef(null);
  const animationCountRef = useRef(0);
  const [currentAnimation, setCurrentAnimation] = useState('Stand2');
  const prevActionRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!scene) return;
    
    const loader = new GLTFLoader();
    loader.load(
      'glTF-models/ram2/ram2_black.gltf',
      (gltf) => {
        const animations = gltf.animations;
        const ramModel = gltf.scene;
        modelRef.current = ramModel;
        
        ramModel.traverse((child) => {
          if (child.isMesh) {
            child.name = child.name || 'BronzebeardMesh';
          }
        });
        
        const mixer = new THREE.AnimationMixer(ramModel);
        mixerRef.current = mixer;
        ramModel.position.set(-525, 9.8, 370); 
        ramModel.rotation.set(0, Math.PI / 1, 0);
        ramModel.scale.set(2, 2, 2);
        scene.add(ramModel);

        console.log('Available animations:', animations.map(a => a.name));

        const animationList = {
          Stand1: 'Stand (ID 0 variation 2)',
          Stand2: 'Stand (ID 0 variation 0)'
        };
        
        // Store all animation actions
        Object.entries(animationList).forEach(([key, animName]) => {
          const clip = THREE.AnimationClip.findByName(animations, animName);
          if (clip) {
            const action = mixer.clipAction(clip);
            // Configure animations for better transitions
            action.clampWhenFinished = false;
            action.loop = THREE.LoopRepeat;
            actionsRef.current[key] = action;
          }
        });
        
        // Play the initial Stand2 animation
        playAnimation('Stand2', 0.5); // Start with a smooth fade in
        
        // Start the animation cycle
        startAnimationCycle();
        
        animate();
      },
      undefined,
      (error) => {
        console.error('An error happened while loading Ram:', error);
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
      
      // Clear any running animations
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [scene]);

  const startAnimationCycle = () => {
    // Using a recursive function instead of interval to have different durations
    const runCycle = () => {
      animationCountRef.current = (animationCountRef.current + 1) % 4;
      
      if (animationCountRef.current === 3) {
        // Every fourth cycle, play Stand1 for 2500ms
        playAnimation('Stand1', 0.4); // Slightly faster crossfade for Stand1
        setCurrentAnimation('Stand1');
;
        
        // Schedule next animation after Stand1 duration
        timeoutRef.current = setTimeout(() => {
          runCycle();
        }, 2500);
      } else {
        // Other cycles, play Stand2 for 3000ms
        playAnimation('Stand2', 0.3); // Smoother crossfade for Stand2
        setCurrentAnimation('Stand2');
;
        
        // Schedule next animation after Stand2 duration
        timeoutRef.current = setTimeout(() => {
          runCycle();
        }, 2000);
      }
    };
    
    // Start the cycle
    runCycle();
  };

  const playAnimation = (animationName, duration = 0.5) => {
    if (!actionsRef.current[animationName]) {
      console.warn(`Animation ${animationName} not found`);
      return;
    }
    
    const action = actionsRef.current[animationName];
    
    if (prevActionRef.current && prevActionRef.current !== action) {
      // Crossfade from the previous animation to the new one
      action.reset();
      action.setEffectiveTimeScale(1);
      action.setEffectiveWeight(1);
      action.time = 0;
      
      // Enable the animation and fade it in
      action.enabled = true;
      action.crossFadeFrom(prevActionRef.current, duration, true);
      action.play();
      
;
    } else {
      // First animation or same animation again
      action.reset();
      action.play();;
    }
    
    // Store this animation as the previous one for next transition
    prevActionRef.current = action;
  };
  
  return null;
}

export default RamModel;