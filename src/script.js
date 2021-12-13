import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DDSLoader } from "three/examples/jsm/loaders/DDSLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";

/**
 * for my bb:
 * a lil someplace warm for your 24th birthday
 * (perhaps it's just another excuse for me to do something special for you)
 *
 * I had fun & learnt a lot putting this together!
 * thank you for being you.
 */

let camera, scene, renderer, controls, mixer, clock;
let composer, fxaaPass;
let gltfModel,
  particles,
  starGeometry,
  starMaterial,
  orb,
  isRotating = true;

const bloomParams = {
  exposure: 1.5,
  bloomStrength: 0.6,
  bloomThreshold: 0.85,
  bloomRadius: 0.4,
};

let mouseX = 0,
  mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

init();
animate();

document.addEventListener(
  "keydown",
  (event) => {
    // var name = event.key;
    // var code = event.code;
    // alert(`Key pressed ${name} \r\n Key code value: ${code}`);
    if (event.code === "Space") {
      isRotating = !isRotating;
    }
    if (event.code === "KeyB") {
      orb.visible = !orb.visible;
    }
  },
  false
);

/**
 *  weeeeeeeeeeeee
 */

function init() {
  const container = document.createElement("div");
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    1,
    2000
  );

  camera.position.x = -22;
  camera.position.y = 13;
  camera.position.z = 28;

  clock = new THREE.Clock();

  /**
   * SCENE
   */
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xadd8e6);
  //scene.fog = new THREE.Fog(0x000000, 100, 1500);

  /**
   * RENDERER
   */
  renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias to get rid of jagged
  renderer.alpha = true;
  renderer.setClearAlpha(0x000000, 0);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;

  container.appendChild(renderer.domElement);

  /**
   * CONTROLS
   */
  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 8;
  controls.maxDistance = 50;
  controls.enableDamping = true;
  // controls.autoRotateSpeed = 0.5;
  // controls.autoRotate = true;
  controls.target.set(0, 3, 0);

  scene.add(camera);

  // Load background texture
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load("assets/images/bkgd_sunset.jfif", function (texture) {
    scene.background = texture;
  });

  const d = 8;
  const ambientLight = new THREE.AmbientLight(0xffeae3, 0.45);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 0.8);
  //pointLight.position.set(0, -5, 0);
  camera.add(pointLight);

  // const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.1);
  // directionalLight2.position.set(0, 44, 0);
  // directionalLight2.shadow.camera.left = -d;
  // directionalLight2.shadow.camera.right = d;
  // directionalLight2.shadow.camera.top = d;
  // directionalLight2.shadow.camera.bottom = -d;
  // directionalLight2.shadow.bias = -0.0001;

  // directionalLight2.castShadow = true;
  // camera.add(directionalLight2);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
  directionalLight.position.set(35, 30, -33);
  directionalLight.shadow.camera.left = -d;
  directionalLight.shadow.camera.right = d;
  directionalLight.shadow.camera.top = 10;
  directionalLight.shadow.camera.bottom = -d;
  directionalLight.shadow.camera.near = -10;
  directionalLight.shadow.camera.far = 1000;
  directionalLight.shadow.bias = -0.0001;
  directionalLight.shadow.radius = 3;
  directionalLight.castShadow = true;
  camera.add(directionalLight);

  //scene.add(new THREE.CameraHelper(pointLight.shadow.camera));
  //scene.add(new THREE.CameraHelper(directionalLight.shadow.camera));

  /**
   * PARTICLES
   */
  starGeometry = new THREE.BufferGeometry();
  const vertices = [];

  const star = new THREE.TextureLoader().load("assets/images/sparkle.png");

  for (let i = 0; i < 5000; i++) {
    const x = 2000 * Math.random() - 1000;
    const y = 4000 * Math.random() - 1000;
    const z = 2000 * Math.random() - 1000;

    vertices.push(x, y, z);
    scene.add;
  }
  starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  starMaterial = new THREE.PointsMaterial({
    size: 30,
    sizeAttenuation: true,
    map: star,
    alphaTest: 0.7,
    transparent: true,
    depthWrite: false,
  });
  starMaterial.color.setHSL(1, 0, 1);

  particles = new THREE.Points(starGeometry, starMaterial);
  scene.add(particles);

  /**
   * POSTPROCESSING
   */
  const renderScene = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  bloomPass.threshold = bloomParams.bloomThreshold;
  bloomPass.strength = bloomParams.bloomStrength;
  bloomPass.radius = bloomParams.bloomRadius;

  const bloomPass2 = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.06,
    0.1,
    0.5
  );

  fxaaPass = new ShaderPass(FXAAShader);
  const pixelRatio = renderer.getPixelRatio();
  fxaaPass.material.uniforms["resolution"].value.x =
    1 / (container.offsetWidth * pixelRatio);
  fxaaPass.material.uniforms["resolution"].value.y =
    1 / (container.offsetHeight * pixelRatio);

  composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);
  // composer.addPass(bloomPass2);
  composer.addPass(fxaaPass);

  /**
   * MODEL
   */
  const onProgress = function (xhr) {
    if (xhr.lengthComputable) {
      const percentComplete = (xhr.loaded / xhr.total) * 100;
      console.log(Math.round(percentComplete, 2) + "% downloaded");
    }
  };

  const onError = function () {};

  const manager = new THREE.LoadingManager();
  manager.addHandler(/\.dds$/i, new DDSLoader());

  /**
   * GLTF LOADER
   */
  const loader = new GLTFLoader();
  loader.load(
    "assets/models/tree.6b.gltf",
    function (gltf) {
      scene.add(gltf.scene);
      gltfModel = gltf.scene;

      gltf.animations; // Array<THREE.AnimationClip>
      gltf.scene; // THREE.Group
      gltf.scenes; // Array<THREE.Group>
      gltf.cameras; // Array<THREE.Camera>
      gltf.asset; // Object

      mixer = new THREE.AnimationMixer(gltf.scene);
      console.log("anim: " + gltf.animations);
      mixer.clipAction(gltf.animations[0]).play(); //tree
      mixer.clipAction(gltf.animations[1]).play(); //flowers
      mixer.clipAction(gltf.animations[2]).play(); //butterfly

      gltf.scene.traverse(function (child) {
        //console.log(child);
        if (child.material?.map) {
          child.material.map.wrapS = THREE.MirroredRepeatWrapping;
          child.material.map.wrapT = THREE.MirroredRepeatWrapping;
          child.material.alphaTest = 0.9;
        }
        if (child instanceof THREE.Mesh) {
          //child.material = new THREE.MeshNormalMaterial();
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      gltf.scene.getObjectByName("Plane0").material.alphaTest = 0.92;
      gltf.scene.getObjectByName("butterfly").material.alphaTest = 0.4;

      orb = gltf.scene.getObjectByName("orb");
      orb.material = new THREE.MeshPhysicalMaterial({
        color: 0xffebcc,
        emissive: 0x450627,
        metalness: 0,
        roughness: 0.2,
        //envMapIntensity: 0.5,
        clearcoat: 1,
        clearcoatRoughness: 0.4,
        transparent: true,
        transmission: 0.9,
        opacity: 0.9,
        reflectivity: 1,
        ior: 1,
      });
      orb.renderOrder = 2;
    },
    // called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // called when loading has errors
    function (error) {
      console.log("An error happened");
    }
  );

  //

  document.addEventListener("mousemove", onDocumentMouseMove);

  //

  window.addEventListener("resize", onWindowResize);
}

//
function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) / 2;
  mouseY = (event.clientY - windowHalfY) / 2;
}

//

function animate() {
  controls.update();
  requestAnimationFrame(animate);
  if (mixer) mixer.update(clock.getDelta());

  render();
}

function render() {
  // camera.position.x += (mouseX - camera.position.x) * 0.001;
  //camera.position.y += (-mouseY - camera.position.y) * 0.001;
  //camera.lookAt(scene.position);

  // particles.position.x = mouseX * 0.01;
  // particles.position.y = mouseY * 0.01;

  if (gltfModel && isRotating) gltfModel.rotation.y += 0.0005;
  animateStars();

  renderer.render(scene, camera);
  composer.render();
}

function animateStars() {
  const starSpeed = 0.15;
  const positions = starGeometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    const v = new THREE.Vector3(
      positions[i],
      positions[i + 1],
      positions[i + 2]
    );
    positions[i] = v.x;
    positions[i + 1] = v.y + starSpeed;
    positions[i + 2] = v.z;

    if (positions[i + 1] > 2000) {
      positions[i + 1] -= 4000;
    }
  }

  starGeometry.attributes.position.needsUpdate = true;
}
