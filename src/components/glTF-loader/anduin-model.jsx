import { useEffect, useRef, useState } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

function AnduinModel({ scene }) {
  const mixerRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const animationFrameRef = useRef(null);
  const modelRef = useRef(null);
  const actionsRef = useRef({});
  const animationIntervalRef = useRef(null);
  const animationCountRef = useRef(0);
  const [currentAnimation, setCurrentAnimation] = useState('Talk');
  const prevActionRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!scene) return;
    
    const loader = new GLTFLoader();
    loader.load(
      'glTF-models/anduin4/anduin4.gltf',
      (gltf) => {
        const animations = gltf.animations;
        const anduinModel = gltf.scene;
        modelRef.current = anduinModel;
        
        anduinModel.traverse((child) => {
          if (child.isMesh) {
            child.name = child.name || 'BronzebeardMesh';
          }
        });
        
        const mixer = new THREE.AnimationMixer(anduinModel);
        mixerRef.current = mixer;
        anduinModel.position.set(-531, 9.8, 364); 
        anduinModel.rotation.set(0, Math.PI / 1, 0);
        anduinModel.scale.set(2, 2, 2);
        scene.add(anduinModel);

        console.log('Available animations:', animations.map(a => a.name));

        const animationList = {
          Laugh: 'EmoteLaugh (ID 70 variation 0)',
          Talk: 'EmoteTalk (ID 60 variation 0)'
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
        
        // Play the initial Talk animation
        playAnimation('Talk', 0.5); // Start with a smooth fade in
        
        // Start the animation cycle
        startAnimationCycle();
        
        animate();
      },
      undefined,
      (error) => {
        console.error('An error happened while loading Anduin V4:', error);
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
        // Every fourth cycle, play Laugh for 2500ms
        playAnimation('Laugh', 0.4); // Slightly faster crossfade for Laugh
        setCurrentAnimation('Laugh');
;
        
        // Schedule next animation after Laugh duration
        timeoutRef.current = setTimeout(() => {
          runCycle();
        }, 2500);
      } else {
        // Other cycles, play Talk for 3000ms
        playAnimation('Talk', 0.3); // Smoother crossfade for Talk
        setCurrentAnimation('Talk');
;
        
        // Schedule next animation after Talk duration
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

export default AnduinModel;