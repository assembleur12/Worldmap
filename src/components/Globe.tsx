// Globe.tsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Activity } from '../types'; // Assurez-vous que le type Activity est défini correctement

interface GlobeProps {
  activities: Activity[]; // Liste des activités
}

export const Globe: React.FC<GlobeProps> = ({ activities }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialisation de la scène, caméra et rendu
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

    // Ajout de la texture de la Terre, des nuages, etc.
    const loader = new THREE.TextureLoader();
    const earthTexture = loader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg'
    );
    const bumpMap = loader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg'
    );
    const specularMap = loader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg'
    );
    const cloudsTexture = loader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
    );

    // Globe
    const globeGeometry = new THREE.SphereGeometry(1, 64, 64);
    const globeMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpMap: bumpMap,
      bumpScale: 0.05,
      specularMap: specularMap,
      specular: new THREE.Color('grey'),
      shininess: 50,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    // Nuages
    const cloudGeometry = new THREE.SphereGeometry(1.01, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(clouds);

    // Lumière
    const light = new THREE.PointLight(0xffffff, 10, 100);
    light.position.set(0, 0, 5);
    scene.add(light);

    camera.position.z = 3;

    // Fonction d'animation
    const animate = () => {
      requestAnimationFrame(animate);
      globe.rotation.y += 0.001;
      renderer.render(scene, camera);
    };
    animate();

    // Fonction pour obtenir les coordonnées 3D depuis les latitudes et longitudes
    const getPositionFromLatLng = (lat: number, lng: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (180 - lng) * (Math.PI / 180);
      return new THREE.Vector3(Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta));
    };

    // Ajouter les arcs pour chaque activité
    activities.slice(-10).forEach((activity) => {
      const startLat = activity.lat;
      const startLng = activity.lng;
      const endLat = activity.lat + Math.random() * 20 - 10;
      const endLng = activity.lng + Math.random() * 20 - 10;

      const points = [];
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

      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const middle = new THREE.Vector3().lerpVectors(start, end, t);
        middle.normalize().multiplyScalar(1 + Math.sin(Math.PI * t) * 0.2);
        points.push(middle);
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const arcGeometry = new THREE.TubeGeometry(curve, 20, 0.003, 8, false);
      const arcMaterial = new THREE.MeshBasicMaterial({ color: 0xffc107, transparent: true, opacity: 0.6 });
      const arc = new THREE.Mesh(arcGeometry, arcMaterial);
      scene.add(arc);
    });

    // Nettoyage lors du démontage du composant
    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [activities]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};
