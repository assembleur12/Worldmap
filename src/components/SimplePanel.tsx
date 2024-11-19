import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { Activity } from '../types'; // Assurez-vous que votre type Activity est bien défini
import { Globe } from './Globe';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, fieldConfig, id }) => {
  const activities: Activity[] = data.series.map((series, index) => ({
    id: index,
    lat: Math.random() * 180 - 90,
    lng: Math.random() * 360 - 180,
    type: series.name === 'commit' ? 'commit' : series.name === 'pull_request' ? 'pull_request' : 'issue',
    timestamp: Date.now().toString(),
  }));

  return (
    <div style={{ height: '100%' }}>
      <Globe activities={activities} />
    </div>
  );
};
// const createGlobe = (activities: any[], container: HTMLElement) => {
//   const scene = new THREE.Scene();
//   const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//   const renderer = new THREE.WebGLRenderer();
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   container.appendChild(renderer.domElement);

//   // Texture loader
//   const loader = new THREE.TextureLoader();
//   const earthTexture = loader.load(
//     'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg'
//   );
//   const bumpMap = loader.load(
//     'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg'
//   );
//   const specularMap = loader.load(
//     'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg'
//   );
//   const cloudsTexture = loader.load(
//     'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
//   );

//   // Globe sphere
//   const globeGeometry = new THREE.SphereGeometry(1, 64, 64);
//   const globeMaterial = new THREE.MeshPhongMaterial({
//     map: earthTexture,
//     bumpMap: bumpMap,
//     bumpScale: 0.05,
//     specularMap: specularMap,
//     specular: new THREE.Color('grey'),
//     shininess: 50,
//   });
//   const globe = new THREE.Mesh(globeGeometry, globeMaterial);
//   scene.add(globe);

//   // Cloud layer
//   const cloudGeometry = new THREE.SphereGeometry(1.01, 64, 64);
//   const cloudMaterial = new THREE.MeshPhongMaterial({
//     map: cloudsTexture,
//     transparent: true,
//     opacity: 0.3,
//     depthWrite: false,
//   });
//   const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
//   scene.add(clouds);

//   // Atmosphere glow
//   const atmosphereGeometry = new THREE.SphereGeometry(1.02, 64, 64);
//   const atmosphereMaterial = new THREE.MeshPhongMaterial({
//     transparent: true,
//     opacity: 0.2,
//     color: '#4B91F7',
//     side: THREE.BackSide,
//   });
//   const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
//   scene.add(atmosphere);

//   // Lighting
//   const light = new THREE.PointLight(0xffffff, 10, 100);
//   light.position.set(0, 0, 5);
//   scene.add(light);

//   camera.position.z = 3;

//   // Rotate globe
//   function animate() {
//     requestAnimationFrame(animate);
//     globe.rotation.y += 0.001;
//     renderer.render(scene, camera);
//   }
//   animate();

//   // Function to convert lat/lng to 3D coordinates
//   const getPositionFromLatLng = (lat: number, lng: number) => {
//     const phi = (90 - lat) * (Math.PI / 180);
//     const theta = (180 - lng) * (Math.PI / 180);
//     return new THREE.Vector3(Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta));
//   };

//   // Create arcs
//   activities.slice(-10).forEach((activity: { lat: number; lng: number }) => {
//     const startLat = activity.lat;
//     const startLng = activity.lng;
//     const endLat = activity.lat + Math.random() * 20 - 10;
//     const endLng = activity.lng + Math.random() * 20 - 10;

//     const points = [];
//     const startPhi = (90 - startLat) * (Math.PI / 180);
//     const startTheta = (180 - startLng) * (Math.PI / 180);
//     const endPhi = (90 - endLat) * (Math.PI / 180);
//     const endTheta = (180 - endLng) * (Math.PI / 180);

//     const start = new THREE.Vector3(
//       Math.sin(startPhi) * Math.cos(startTheta),
//       Math.cos(startPhi),
//       Math.sin(startPhi) * Math.sin(startTheta)
//     );
//     const end = new THREE.Vector3(
//       Math.sin(endPhi) * Math.cos(endTheta),
//       Math.cos(endPhi),
//       Math.sin(endPhi) * Math.sin(endTheta)
//     );

//     for (let i = 0; i <= 20; i++) {
//       const t = i / 20;
//       const middle = new THREE.Vector3().lerpVectors(start, end, t);
//       middle.normalize().multiplyScalar(1 + Math.sin(Math.PI * t) * 0.2);
//       points.push(middle);
//     }

//     const curve = new THREE.CatmullRomCurve3(points);
//     const arcGeometry = new THREE.TubeGeometry(curve, 20, 0.003, 8, false);
//     const arcMaterial = new THREE.MeshBasicMaterial({ color: 0xffc107, transparent: true, opacity: 0.6 });
//     const arc = new THREE.Mesh(arcGeometry, arcMaterial);
//     scene.add(arc);
//   });

//   // Create pulses
//   activities.slice(-20).forEach((activity: { lat: any; lng: any }) => {
//     const position = getPositionFromLatLng(activity.lat, activity.lng).multiplyScalar(1.01);
//     const pulseGeometry = new THREE.CircleGeometry(0.05, 32);
//     const pulseMaterial = new THREE.MeshBasicMaterial({
//       color: 0xffc107,
//       transparent: true,
//       opacity: 1,
//       side: THREE.DoubleSide,
//     });
//     const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
//     pulse.position.copy(position);
//     scene.add(pulse);
//   });

//   // Create particles
//   const particleCount = activities.length;
//   const positions = new Float32Array(particleCount * 3);
//   const colors = new Float32Array(particleCount * 3);
//   const sizes = new Float32Array(particleCount);

//   activities.forEach((activity: { lat: number; lng: number; type: string }, i: number) => {
//     const phi = (90 - activity.lat) * (Math.PI / 180);
//     const theta = (180 - activity.lng) * (Math.PI / 180);

//     positions[i * 3] = Math.sin(phi) * Math.cos(theta);
//     positions[i * 3 + 1] = Math.cos(phi);
//     positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta);

//     const color = new THREE.Color(
//       activity.type === 'commit' ? '#4CAF50' : activity.type === 'pull_request' ? '#2196F3' : '#FFC107'
//     );

//     colors[i * 3] = color.r;
//     colors[i * 3 + 1] = color.g;
//     colors[i * 3 + 2] = color.b;

//     sizes[i] = 0.05 + Math.random() * 0.02;
//   });

//   const particleGeometry = new THREE.BufferGeometry();
//   particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
//   particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
//   particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

//   const particleMaterial = new THREE.PointsMaterial({
//     size: 0.05,
//     vertexColors: true,
//     transparent: true,
//     opacity: 0.8,
//     sizeAttenuation: true,
//     depthWrite: false,
//   });

//   const particlesMesh = new THREE.Points(particleGeometry, particleMaterial);
//   scene.add(particlesMesh);

//   return { scene, camera, renderer };
// };

// export const SimplePanel: React.FC<Props> = ({ options, data, width, height, fieldConfig, id }) => {
//   console.log('data', data.series);
//   // console.log('width', width);
//   // console.log('height', height);
//   // console.log('fieldConfig', fieldConfig);
//   // console.log('id', id);

//   const containerRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     if (containerRef.current) {
//       const activities: Activity[] = data.series.map((series, index) => ({
//         id: index,
//         lat: Math.random() * 180 - 90,
//         lng: Math.random() * 360 - 180,
//         type: series.name === 'commit' ? 'commit' : series.name === 'pull_request' ? 'pull_request' : 'issue',
//         timestamp: Date.now().toString(),
//       }));

//       createGlobe(activities, containerRef.current);
//     }
//   }, [data]);

//   // if (data.state === 'Error') {
//   //   return <PanelDataErrorView />;
//   // }

//   return <div ref={containerRef} style={{ width: width, height: height }} />;
// };
