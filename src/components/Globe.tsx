import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Activity } from '../types'; // Assurez-vous que le type Activity est défini correctement

interface GlobeProps {
  activities: Activity[]; // Liste des activités
}

export const Globe: React.FC<GlobeProps> = ({ activities }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  console.log('++++++++++++++++', activities);

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
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Ajout des contrôles de rotation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Animation fluide
    controls.dampingFactor = 0.05; // Facteur de lissage
    controls.minDistance = 1.5; // Distance minimale de zoom
    controls.maxDistance = 5; // Distance maximale de zoom
    controls.rotateSpeed = 0.7; // Vitesse de rotation

    // Ajout de la texture de la Terre, des nuages, etc.
    const loader = new THREE.TextureLoader();
    // Définir les URLs dans une variable
    const textureUrls = {
      earth: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
      bump: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
      specular:
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
      clouds:
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
    };

    // Charger les textures à partir des URLs
    const textures = {
      earth: loader.load(textureUrls.earth),
      bump: loader.load(textureUrls.bump),
      specular: loader.load(textureUrls.specular),
      clouds: loader.load(textureUrls.clouds),
    };

    // Utilisation
    const earthTexture = textures.earth;
    const bumpMap = textures.bump;
    const specularMap = textures.specular;
    const cloudsTexture = textures.clouds;

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

    // Lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // Lumière ambiante
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    camera.position.z = 3;

    // Fonction d'animation
    const animate = () => {
      requestAnimationFrame(animate);

      // Mise à jour des contrôles
      controls.update();

      // Rotation automatique du globe si l'utilisateur ne l'utilise pas
      if (!controls.enabled) {
        globe.rotation.y += 0.001;
      }

      // Rendu
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
    activities.forEach((activity) => {
      const start = getPositionFromLatLng(activity.lat, activity.lng);
      //console.log('start', start);
      const end = getPositionFromLatLng(activity.lat + Math.random() * 20 - 10, activity.lng + Math.random() * 20 - 10);
      //console.log('end', end);
      const points = [];
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const middle = new THREE.Vector3().lerpVectors(start, end, t);
        middle.normalize().multiplyScalar(1 + Math.sin(Math.PI * t) * 0.2);
        //console.log('middle', middle);
        points.push(middle);
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const arcGeometry = new THREE.TubeGeometry(curve, 20, 0.003, 8, false);
      const arcMaterial = new THREE.MeshBasicMaterial({ color: 0xffc107, transparent: true, opacity: 0.6 });
      const arc = new THREE.Mesh(arcGeometry, arcMaterial);
      scene.add(arc);
    });

    let activityCount = 0; // Compteur pour les activités

    // Ajouter des marqueurs pour chaque activité
    activities.forEach((activity) => {
      const position = getPositionFromLatLng(activity.lat, activity.lng);

      // Création d'une sphère pour représenter l'activité
      const markerGeometry = new THREE.SphereGeometry(0.02, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);

      // Positionner le marqueur sur le globe
      marker.position.copy(position);
      scene.add(marker);

      // Incrémenter le compteur d'activités et de marqueurs
      activityCount++;
    });

    console.log("Nombre d'activités :", activityCount);
    console.log('Nombre de marqueurs :', activityCount);
    // Nettoyage lors du démontage
    return () => {
      controls.dispose();
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [activities]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};
