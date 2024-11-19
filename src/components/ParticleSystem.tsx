import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Activity } from '../types';

interface ParticleSystemProps {
  activities: Activity[];
  width: number;
  height: number;
}

export const ParticleSystem = ({ activities, width, height }: ParticleSystemProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Créer une scène, une caméra et un renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    if (containerRef.current) {
      containerRef.current.appendChild(renderer.domElement);
    }

    // Créer un système de particules
    const particles = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({
        size: 0.05,
        transparent: true,
        opacity: 0.8,
        vertexColors: true,
        sizeAttenuation: true,
        depthWrite: false,
      })
    );
    scene.add(particles);

    // Créer les buffers pour les positions, couleurs et tailles des particules
    const positions = new Float32Array(activities.length * 3);
    const colors = new Float32Array(activities.length * 3);
    const sizes = new Float32Array(activities.length);

    activities.forEach((activity, i) => {
      const phi = (90 - activity.lat) * (Math.PI / 180);
      const theta = (180 - activity.lng) * (Math.PI / 180);

      positions[i * 3] = Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.cos(phi);
      positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta);

      const color = new THREE.Color(
        activity.type === 'commit' ? '#4CAF50' : activity.type === 'pull_request' ? '#2196F3' : '#FFC107'
      );

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Randomize particle sizes slightly
      sizes[i] = 0.05 + Math.random() * 0.02;
    });

    // Associer les attributs au système de particules
    const geometry = particles.geometry;
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Positionner la caméra
    camera.position.z = 5;

    const animate = () => {
      // Rotation de la scène
      particles.rotation.y += 0.001;

      // Mise à jour de la taille des particules en fonction de la distance à la caméra
      const distance = camera.position.length();
      (particles.material as THREE.PointsMaterial).size = Math.max(0.02, 0.05 * (2 / distance));

      // Rendu de la scène
      renderer.render(scene, camera);

      // Demander le prochain frame d'animation
      requestAnimationFrame(animate);
    };

    animate();

    // Nettoyage au démontage du composant
    return () => {
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [activities, width, height]);

  return <div ref={containerRef} style={{ width, height }} />;
};
