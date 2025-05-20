import { useEffect } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

function IronforgeModel({ scene }) {
  useEffect(() => {
    if (!scene) return;
    
    const ironforgeLoader = new GLTFLoader();
    ironforgeLoader.load(
      'glTF-models/wow.export/world/wmo/khazmodan/cities/ironforge/ironforge.gltf',
      (gltf) => {
        const ironforgeModel = gltf.scene;
        ironforgeModel.position.set(10, 20, 0); 
        ironforgeModel.scale.set(2, 2, 2);
        scene.add(ironforgeModel);
      },
      undefined,
      (error) => {
        console.error('An error happened while loading Ironforge:', error);
      }
    );
    
  }, [scene]); // Only re-run if scene changes

  return null; // This component doesn't render anything
}

export default IronforgeModel
