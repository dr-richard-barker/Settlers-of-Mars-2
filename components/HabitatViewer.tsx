
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import { HabitatPart } from '../types';
import DownloadIcon from './icons/DownloadIcon';

interface HabitatViewerProps {
  parts: HabitatPart[];
}

const HabitatViewer: React.FC<HabitatViewerProps> = ({ parts }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  const downloadStl = () => {
    if (sceneRef.current) {
        const exporter = new STLExporter();
        const result = exporter.parse(sceneRef.current, { binary: true });
        const blob = new Blob([result], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.style.display = 'none';
        document.body.appendChild(link);
        link.href = URL.createObjectURL(blob);
        link.download = 'mars-habitat.stl';
        link.click();
        document.body.removeChild(link);
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 10;
    camera.position.y = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 3;
    controls.maxDistance = 50;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
        if (mountRef.current) {
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        }
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear existing parts
    while (scene.children.length > 2) { // Keep lights
      scene.remove(scene.children[2]);
    }
    
    const material = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.8, roughness: 0.3 });

    parts.forEach(part => {
      let geometry: THREE.BufferGeometry;
      switch (part.partType) {
        case 'CYLINDER':
          geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
          break;
        case 'DOME':
          geometry = new THREE.SphereGeometry(0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
          break;
        case 'TUBE':
           geometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 24);
           break;
        case 'AIRLOCK':
           geometry = new THREE.BoxGeometry(0.4, 0.6, 0.4);
           break;
        default:
          return;
      }
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(part.position.x, part.position.y, part.position.z);
      mesh.rotation.set(part.rotation.x, part.rotation.y, part.rotation.z);
      mesh.scale.set(part.scale.x, part.scale.y, part.scale.z);
      scene.add(mesh);
    });

  }, [parts]);


  return (
    <div className="w-full h-full flex-grow relative">
        <div ref={mountRef} className="w-full h-full rounded-b-md" />
        <button
            onClick={downloadStl}
            title="Download .STL file"
            className="absolute bottom-2 right-2 bg-orange-600/80 hover:bg-orange-500/90 p-2 rounded-full text-white transition-colors"
            aria-label="Download habitat as STL file"
        >
            <DownloadIcon className="w-5 h-5" />
        </button>
    </div>
  );
};

export default HabitatViewer;
