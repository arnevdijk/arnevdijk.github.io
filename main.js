import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const geometry = new THREE.BoxGeometry();
  const textureLoader = new THREE.TextureLoader();
  const materials = [
    new THREE.MeshBasicMaterial({ map: textureLoader.load('https://threejs.org/examples/textures/crate.gif') }),
    new THREE.MeshBasicMaterial({ map: textureLoader.load('https://threejs.org/examples/textures/crate.gif') }),
    new THREE.MeshBasicMaterial({ map: textureLoader.load('https://threejs.org/examples/textures/crate.gif') }),
    new THREE.MeshBasicMaterial({ map: textureLoader.load('https://threejs.org/examples/textures/crate.gif') }),
    new THREE.MeshBasicMaterial({ map: textureLoader.load('https://threejs.org/examples/textures/crate.gif') }),
    new THREE.MeshBasicMaterial({ map: textureLoader.load('https://threejs.org/examples/textures/crate.gif') })
  ];
  const cube = new THREE.Mesh(geometry, materials);
  scene.add(cube);
  function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  animate();
  camera.position.z = 5;