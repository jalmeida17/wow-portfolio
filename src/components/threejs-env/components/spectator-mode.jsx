import { useEffect } from 'react';
import * as THREE from 'three';

const SpectatorMode = ({ camera, controls, moveSpeed = 1.0 }) => {
  useEffect(() => {
    if (!camera || !controls) return;
    
    // Keyboard movement variables
    const keysPressed = {};
    
    // Set up keyboard event listeners
    const handleKeyDown = (event) => {
      keysPressed[event.key.toLowerCase()] = true;
    };
    
    const handleKeyUp = (event) => {
      keysPressed[event.key.toLowerCase()] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Function to handle camera movement based on keys pressed
    const handleCameraMovement = () => {
      if (!camera) return;
      
      // Create direction vector in camera's local space
      const direction = new THREE.Vector3();
      
      // Forward/backward (W/S or Z/S)
      if (keysPressed['w'] || keysPressed['z']) {
        direction.z -= 1; // Forward
      }
      if (keysPressed['s']) {
        direction.z += 1; // Backward
      }
      
      // Left/right (A/D or Q/D)
      if (keysPressed['a'] || keysPressed['q']) {
        direction.x -= 1; // Left
      }
      if (keysPressed['d']) {
        direction.x += 1; // Right
      }
      
      // Up/down (Space/Shift)
      if (keysPressed[' ']) {
        direction.y += 1; // Up
      }
      if (keysPressed['shift']) {
        direction.y -= 1; // Down
      }
      
      // If there's movement, normalize the direction vector
      if (direction.length() > 0) {
        direction.normalize().multiplyScalar(moveSpeed);
        
        // Convert direction from camera's local space to world space
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        
        // Create a rotation matrix based on camera's orientation (but keep y-up)
        const rotationMatrix = new THREE.Matrix4();
        rotationMatrix.lookAt(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(cameraDirection.x, 0, cameraDirection.z).normalize(),
          new THREE.Vector3(0, 1, 0)
        );
        
        // Apply rotation to direction vector
        direction.applyMatrix4(rotationMatrix);
        
        // Move camera
        camera.position.add(direction);
        
        // Update OrbitControls target to keep proper rotation center
        controls.target.copy(camera.position).add(cameraDirection);
      }
      
      // Update camera coordinates display
      const cameraCoords = document.getElementById('cameraCoords');
      if (cameraCoords) {
        cameraCoords.textContent = `X: ${camera.position.x.toFixed(2)}, Y: ${camera.position.y.toFixed(2)}, Z: ${camera.position.z.toFixed(2)}`;
      }
    };
    
    // Setup animation frame for continuous movement handling
    let animationFrameId;
    const animate = () => {
      handleCameraMovement();
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [camera, controls, moveSpeed]);

  return null; // This is a behavior component, it doesn't render anything
};

export default SpectatorMode;