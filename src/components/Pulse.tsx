import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface PulseProps {
  width: number;
  height: number;
  color: string;
}

export const Pulse: React.FC<PulseProps> = ({ width, height, color }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialisation de la scène, de la caméra et du rendu
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    if (containerRef.current) {
      containerRef.current.appendChild(renderer.domElement);
    }

    // Création de la géométrie (cercle)
    const geometry = new THREE.CircleGeometry(1, 32);
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Positionnement de la caméra
    camera.position.z = 5;

    const startTime = Date.now();

    // Fonction d'animation
    const animate = () => {
      const elapsedTime = (Date.now() - startTime) / 1000;

      // Mise à jour de l'échelle et de l'opacité
      const scale = 1 + Math.sin(elapsedTime * 3) * 0.2;
      mesh.scale.set(scale, scale, scale);
      material.opacity = Math.max(0, 1 - elapsedTime / 2);

      // Rendu de la scène
      renderer.render(scene, camera);

      // Appel de l'animation suivante
      requestAnimationFrame(animate);
    };

    animate();

    // Nettoyage lors du démontage du composant
    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [width, height, color]);

  return <div ref={containerRef} style={{ width, height }} />;
};
