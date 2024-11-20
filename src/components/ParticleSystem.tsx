import { useEffect } from 'react';
import * as THREE from 'three';
import { Activity } from '../types';

interface ParticleSystemProps {
  activities: Activity[];
  scene: THREE.Scene; // La scène principale du globe
  camera: THREE.PerspectiveCamera; // La caméra principale du globe
}

export const ParticleSystem = ({ activities, scene, camera }: ParticleSystemProps) => {
  useEffect(() => {
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

      sizes[i] = 0.05 + Math.random() * 0.02;
    });

    // Associer les attributs au système de particules
    const geometry = particles.geometry;
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Ajouter une animation
    const animate = () => {
      particles.rotation.y += 0.001;

      // Mettre à jour la taille des particules en fonction de la distance à la caméra
      const distance = camera.position.length();
      (particles.material as THREE.PointsMaterial).size = Math.max(0.02, 0.05 * (2 / distance));
    };

    // Ajouter une animation à la boucle principale
    const tick = () => {
      animate();
    };

    scene.userData.tick = tick;

    // Nettoyage au démontage
    return () => {
      scene.remove(particles);
    };
  }, [activities, scene, camera]);

  return null; // Ce composant n'a pas de rendu DOM
};
