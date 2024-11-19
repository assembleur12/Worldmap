import React from 'react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ArcProps {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
}

export const Arc = ({ startLat, startLng, endLat, endLng, color }: ArcProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialisation de la scène, de la caméra et du rendu
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Créer un matériau pour l'arc
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 });

    // Calculer les positions de départ et de fin en 3D
    const startPhi = (90 - startLat) * (Math.PI / 180);
    const startTheta = (180 - startLng) * (Math.PI / 180);
    const endPhi = (90 - endLat) * (Math.PI / 180);
    const endTheta = (180 - endLng) * (Math.PI / 180);

    const start = new THREE.Vector3(
      Math.sin(startPhi) * Math.cos(startTheta),
      Math.cos(startPhi),
      Math.sin(startPhi) * Math.sin(startTheta)
    );
    const end = new THREE.Vector3(
      Math.sin(endPhi) * Math.cos(endTheta),
      Math.cos(endPhi),
      Math.sin(endPhi) * Math.sin(endTheta)
    );

    // Créer une courbe entre les deux points
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const middle = new THREE.Vector3().lerpVectors(start, end, t);
      middle.normalize().multiplyScalar(1 + Math.sin(Math.PI * t) * 0.2);
      points.push(middle);
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 20, 0.003, 8, false);

    const arc = new THREE.Mesh(geometry, material);
    scene.add(arc);

    // Positionner la caméra
    camera.position.z = 3;

    // Animation de l'arc
    const startTime = Date.now();
    const animate = () => {
      const elapsedTime = (Date.now() - startTime) / 1000;

      // Modifier l'opacité de l'arc avec le temps
      material.opacity = Math.max(0, 1 - elapsedTime / 3);

      // Rotation de l'arc pour un effet visuel
      arc.rotation.y += 0.01;

      // Rendu de la scène
      renderer.render(scene, camera);

      // Demander à rafraîchir le rendu à chaque frame
      requestAnimationFrame(animate);
    };

    animate();

    // Nettoyage lorsque le composant est démonté
    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [startLat, startLng, endLat, endLng, color]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};
