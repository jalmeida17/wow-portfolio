import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import IronforgeModel from '../glTF-loader/ironforge-model';
import BronzebeardModel from '../glTF-loader/bronzebeard-model';
import SpectatorMode from './components/spectator-mode';

function ThreeJSEnv() {
  const mountRef = useRef(null);
  const [sceneRef, setSceneRef] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [controlsRef, setControlsRef] = useState(null);
  const [spectatorMode, setSpectatorMode] = useState(false);
  const scenesPositions = {
  magnibronzebeard: { x: -266.47, y: 11.66, z: -15.39 },
  test: {x: -534, y: 11.66, z: 364},}
  const [sceneIndex, setSceneIndex] = useState(0); // Use state for the index
  const sceneKeys = Object.keys(scenesPositions); // Get array of scene keys
  const [currentScene, setCurrentScene] = useState(scenesPositions[sceneKeys[0]]);


  useEffect(() => {
    if (!mountRef.current) {
      return;
    }

    const currentMount = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    setSceneRef(scene);
    scene.background = new THREE.Color(0xcccccc); // Set a background color

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // soft white light, increased intensity
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // white light from a direction
    directionalLight.position.set(5, 10, 7.5); // position the light
    scene.add(directionalLight);

    const camera = new THREE.PerspectiveCamera( 90, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000 );
    setCameraRef(camera);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( currentMount.clientWidth, currentMount.clientHeight );
    currentMount.appendChild( renderer.domElement );

    // OrbitControls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    setControlsRef(controls);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.8;
    controls.minDistance = 1;
    controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI / 2;
    controls.zoomSpeed = 1.0; // Default zoom speed

    camera.position.set(currentScene.x, currentScene.y, currentScene.z); // Set initial camera position

    
    let animationFrameId;
    const animate = () => {
      controls.update(); // only required if controls.enableDamping or controls.autoRotate are set to true
      renderer.render( scene, camera );
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (currentMount) {
        camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      gridHelper.dispose();
      controls.dispose();
    };
  }, []);

  useEffect(() => {
  if (controlsRef) {
    controlsRef.enabled = spectatorMode;
    controlsRef.enableZoom = spectatorMode;
    controlsRef.enableRotate = spectatorMode;
    controlsRef.enablePan = spectatorMode;
  }
}, [spectatorMode, controlsRef]);

  const nextScene = () => {
    const nextIndex = (sceneIndex + 1) % sceneKeys.length;
    setSceneIndex(nextIndex);
    setCurrentScene(scenesPositions[sceneKeys[nextIndex]]);
  }
  
  const prevScene = () => {
    const prevIndex = (sceneIndex - 1 + sceneKeys.length) % sceneKeys.length;
    setSceneIndex(prevIndex);
    setCurrentScene(scenesPositions[sceneKeys[prevIndex]]);
  }

  useEffect(() => {
  if (cameraRef && currentScene && controlsRef) {
    // Set camera position
    cameraRef.position.set(currentScene.x, currentScene.y, currentScene.z);
    
    // Reset the orbit controls target to be in front of where the camera is looking
    const lookDirection = new THREE.Vector3(0, 0, -1);
    lookDirection.applyQuaternion(cameraRef.quaternion);
    
    // Set target position to be 10 units in front of the camera
    const targetPosition = new THREE.Vector3();
    targetPosition.copy(cameraRef.position).add(lookDirection.multiplyScalar(10));
    
    controlsRef.target.copy(targetPosition);
    controlsRef.update(); // Important: update controls after changing target
  }
}, [currentScene, cameraRef, controlsRef]);


  return (
    <>{spectatorMode == false && (
      <div>
        <button
        style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          padding: '5px 5px',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 10
        }} onClick={() => prevScene()}> {'<- Previous'}</button>
  
        <button
        style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          padding: '5px 5px',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 10,
        }} onClick={() => nextScene()}>{'Next ->'}</button>
      </div>
    )}
    <button
      style={{
        position: 'absolute',
        top: 10,
        left: 10,
        padding: '5px 5px',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        zIndex: 10
      }}
      onClick={() => setSpectatorMode(!spectatorMode)}>
      {spectatorMode ? 'Exit Spectator Mode' : 'Enter Spectator Mode'}
    </button>
    
      <div
        style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          overflow: 'hidden'
        }}
      >
        {sceneRef && (
          <>
            <IronforgeModel scene={sceneRef} /> 
            <BronzebeardModel scene={sceneRef} />
          </>
        )}
        {cameraRef && controlsRef && spectatorMode && (
          <SpectatorMode 
            camera={cameraRef} 
            controls={controlsRef} 
            moveSpeed={1}
            rotateSpeed={0.05}
          />
        )}
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
        { spectatorMode && (
        <div
          id="cameraCoords"
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: '#fff',
            padding: '5px',
            fontSize: '14px',
            zIndex: 10
          }}

        >
        </div>
        )}

        { spectatorMode && (  
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: '#fff',
            padding: '5px',
            fontSize: '14px',
            zIndex: 10
          }}
        >
          Controls: WASD/ZQSD to move | Space/Shift for up/down
        </div>
        )}
      
      </div>
    </>
  );
}

export default ThreeJSEnv;