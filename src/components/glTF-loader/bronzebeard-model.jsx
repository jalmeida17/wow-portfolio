import { useEffect, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';


function BronzebeardModel({ scene }) {

  const mixerRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const animationFrameRef = useRef(null); // Add this to store and cancel animation frames

  useEffect(() => {
    if (!scene) return;
    
    const loader = new GLTFLoader();
    loader.load(
      'glTF-models/magnibronzebeard3/magnibronzebeard3.gltf',
      (gltf) => {
        const animations = gltf.animations;
        const bronzebeardModel = gltf.scene;
        const mixer = new THREE.AnimationMixer(bronzebeardModel);
        mixerRef.current = mixer;
        bronzebeardModel.position.set(-264.38, 9.5, -15.09); 
        bronzebeardModel.rotation.set(0, Math.PI / 1, 0); // Rotate the model to face the camera
        bronzebeardModel.scale.set(2, 2, 2);
        scene.add(bronzebeardModel);

        console.log('Available animations:', animations.map(a => a.name));
        
        const animation = THREE.AnimationClip.findByName(animations, 'EmoteFlex (ID 82 variation 0)');
        if (animation) {
          const action = mixer.clipAction(animation);
          console.log('Animation found:', action);
          action.play();
        } else {
          console.warn('Animation "EmoteFlex (ID 82 variation 0)" not found');
          // Try the first available animation as fallback
          if (animations.length > 0) {
            const action = mixer.clipAction(animations[0]);
            console.log('Playing fallback animation:', animations[0].name);
            action.play();
          }
        }

        animate();
      },
      undefined,
      (error) => {
        console.error('An error happened while loading Magni Bronzebeard :', error);
      }
    );
    
    // Animation loop function
    const animate = () => {
      const delta = clockRef.current.getDelta();
      
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }
      
      // Store the animation frame ID so we can cancel it later
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    // Cleanup function
    return () => {
      // Cancel the animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Stop all animations
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
    
  }, [scene]); // Only re-run if scene changes
  
  return null; // This component doesn't render anything
}

export default BronzebeardModel