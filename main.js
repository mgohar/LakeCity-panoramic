import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import gsap from "gsap";
//===================================================== SHADERS
const vertexShader = `
varying vec2 vUv;
varying float vDistance;
  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vDistance = -mvPosition.z; 
  }
`;

const fragmentShader = `
  uniform sampler2D imageTexture;
  varying vec2 vUv;
  uniform float opacity;
  varying float vDistance;

  void main() {
    vec4 color = texture2D(imageTexture, vUv);
    gl_FragColor = color; // Adjust the color as needed
  }
`;

//===================================================== Variables
let canvas,
  gltfloader = new GLTFLoader(),
  WIDTH = window.innerWidth,
  HEIGHT = window.innerHeight;

canvas = document.querySelector(".canvas");
gltfloader = new GLTFLoader();

//===================================================== Create a WebGL renderer
var renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  powerPreference: "high-performance",
  alpha: true,
  antialias: true,
  stencil: false,
  depth: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);

//===================================================== Create an empty scene
var scene = new THREE.Scene();
// scene.background=new THREE.TextureLoader().load("src/StandardCubeMap.png");

// Set the scene background to the cubemap
// scene.background = cubeMap;
//===================================================== Create a perpsective camera
var camera = new THREE.PerspectiveCamera(55, WIDTH / HEIGHT, 0.001, 1000);
camera.position.z = 0.5;

//===================================================== Orbit Controls
const orbitControls = new OrbitControls(camera, canvas);
orbitControls.enableDamping = true;
orbitControls.enableZoom = false;
orbitControls.minPolarAngle = Math.PI / 3;

//===================================================== Resize
window.addEventListener("resize", function () {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

//===================================================== FOG
var fogColor = new THREE.Color("red"); // Choose a color for the fog
var near = 0;
var far = 1000;
scene.fog = new THREE.Fog(fogColor, near, far);
//===================================================== Create a Mesh
const loader = new THREE.TextureLoader();
const src = "https://cdn.jsdelivr.net/gh/mgohar/LakeCity-panoramic@v0.0.1/src/room360.jpg";
loader.load(src, (texture) => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1;
  const geometry = new THREE.SphereGeometry(0.1, 360, 64);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: THREE.BackSide,
    uniforms: {
      imageTexture: { value: texture  },
    },
  });
  // const material = new THREE.MeshBasicMaterial({
  //     map: texture,
  //     side: THREE.BackSide,
  //     reflectivity: 0,
  // });
  const sphere = new THREE.Mesh(geometry, material);

  scene.add(sphere);
  sphere.rotation.set(1.37,0,0);
  gsap.to(sphere.rotation,{x:0,duration:1.5,ease:"inOut",delay:2})
  gsap.to(camera.position,{z:0.1,duration:1.5,ease:"inOut",delay:2})
  gsap.to(sphere.rotation,{y:3,duration:1.5,ease:"inOut",delay:2})
});
//===================================================== Create a point light in our scene
var ambientLight = new THREE.AmbientLight("#ffffff", 100);
scene.add(ambientLight);

//===================================================== Animate

const clock = new THREE.Clock();
function Animation() {
  const elapsedTime = clock.getElapsedTime();
  renderer.render(scene, camera);
  requestAnimationFrame(Animation);
}

Animation();
//===================================================== TransformControls

function TControl(name, type = "P", group = true) {
  let tControl = new TransformControls(camera, renderer.domElement);
  tControl.addEventListener("dragging-changed", (event) => {
    orbitControls.enabled = !event.value;
  });
  tControl.attach(name);
  scene.add(tControl);

  tControl.addEventListener("change", () => {
    // The object's position has changed
    const newPosition = name.position;
    const newRotate = name.rotation;
    const newScale = name.scale;
    type == "R"
      ? (console.log("New Rotation:", {
          x: parseFloat(newRotate.x.toFixed(2)),
          y: parseFloat(newRotate.y.toFixed(2)),
          z: parseFloat(newRotate.z.toFixed(2)),
        }),
        tControl.setMode("rotate"))
      : type == "S"
      ? (console.log("New Scale:", {
          x: parseFloat(newScale.x.toFixed(2)),
          y: parseFloat(newScale.y.toFixed(2)),
          z: parseFloat(newScale.z.toFixed(2)),
        }),
        tControl.setMode("scale"))
      : (console.log("New Position:", {
          x: parseFloat(newPosition.x.toFixed(2)),
          y: parseFloat(newPosition.y.toFixed(2)),
          z: parseFloat(newPosition.z.toFixed(2)),
        }),
        tControl.setMode("translate"));
  });
}
//===================================================== Debugger

const axesHelper = new THREE.AxesHelper(10); // Adjust the size as needed
// scene.add(axesHelper);

//===================================================== Other function
