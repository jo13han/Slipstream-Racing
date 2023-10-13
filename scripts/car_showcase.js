import * as THREE from "https://cdn.skypack.dev/three@0.132.2";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/FBXLoader";
import { EffectComposer } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/UnrealBloomPass.js";
import { BokehPass } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/BokehPass.js";
import { ShaderPass } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/ShaderPass.js";
import { LensDistortionShader } from "./shaders/LensDistortionShader.js";

//TODO - don't import seperately for files
// make cleaner structure for different canvas
const button = document.getElementById("showcase-btn");
const closeBtn = document.getElementById("showcase-close-btn");
const loadingScreen = document.getElementById("loading-container");
const canvas = document.getElementById("car-canvas");
let composer;

button.onclick = function () {
	loadingScreen.classList.add("active");
	setTimeout(function () {
		// dummy loading for now
		canvas.classList.add("active");
		loadingScreen.classList.remove("active");
		closeBtn.classList.add("active");
	}, 1000);
};
closeBtn.onclick = function () {
	closeBtn.classList.remove("active");
	canvas.classList.remove("active");
};

(function () {
	const maxHeight = window.innerHeight;
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 1, 50);
	//   camera.near = 1000
	camera.far = 5000;
	camera.position.z = 25;
	camera.position.y = 5;
	camera.position.x = 12;
	const wheels = [];

	const renderer = new THREE.WebGLRenderer({
		canvas,
		alpha: false,
		antialias: true,
	});
	renderer.setClearColor(0x000000, 0);
	renderer.toneMapping = THREE.ReinhardToneMapping;
	renderer.toneMappingExposure = 1;

	const renderScene = new RenderPass(scene, camera);

	const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
	bloomPass.threshold = 0.1;
	bloomPass.strength = 1.3;
	bloomPass.radius = 0;

	const depthOfFieldPass = new BokehPass(scene, camera, {
		focus: 200,
		aperture: 5,
		maxblur: 0.001,

		width: window.innerWidth,
		height: window.innerHeight,
	});

	const chromaticAberrationPass = new ShaderPass(LensDistortionShader);
	
	composer = new EffectComposer(renderer);
	composer.addPass(renderScene);
	composer.addPass(bloomPass);
	composer.addPass(depthOfFieldPass);
  //composer.addPass(chromaticAberrationPass);

	const controls = new OrbitControls(camera, renderer.domElement);
	/*   controls.enablePan = false;
  controls.enableDamping = false;
  controls.campingFactor = 0.25;
  controls.enableZoom = false;
  controls.minDistance = 13;
  controls.maxDistance = 13;
  controls.minPolarAngle = degrees_to_radians(67);
  controls.maxPolarAngle = degrees_to_radians(67); */
	controls.update();
	//controls.target.add(new THREE.Vector3(0, 0, 2));

	const roughnessMap = new THREE.TextureLoader().load("../assets/textures/roughness_map.jpg", (tex) => {
		tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
		tex.repeat.set(10, 10);
	});
	const normalMap = new THREE.TextureLoader().load("../assets/textures/normal_map.jpg", (tex) => {
		tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
		tex.repeat.set(10, 10);
	});

	let showcaseFloor = new THREE.Mesh(
		new THREE.PlaneGeometry(100, 100),
		new THREE.MeshStandardMaterial({
			/*  map: texture,  */
			color: new THREE.Color(0.015, 0.015, 0.015),
			side: THREE.DoubleSide,
			normalScale: new THREE.Vector2(0.15, 0.15),
			roughness: 0.7,
			envMapIntensity: 0,
			roughnessMap,
			normalMap,
		})
	);
  showcaseFloor.name = "road"
	showcaseFloor.frustumCulled = false;
	showcaseFloor.rotateX(-Math.PI * 0.5);
	showcaseFloor.rotateZ(-Math.PI / 2);
	//showcaseFloor.position.y = -0.5;
	showcaseFloor.receiveShadow = true;
	scene.add(showcaseFloor);

	const rings = [];
	new Array(14).fill(0).forEach((_, i) => {
		let ring = new THREE.Mesh(
			new THREE.TorusGeometry(3.35, 0.05, 16, 100),
			new THREE.MeshStandardMaterial({
				color: new THREE.Color(0, 0, 0),
				emissive: new THREE.Color(4, 0.1, 0.4),
			})
		);
		ring.rotateY(Math.PI / 2);
		rings.push(ring);
		scene.add(ring);
	});

	let fillLight = new THREE.DirectionalLight(new THREE.Color(0xffffff), 2);
	fillLight.intensity = 0.6;
	fillLight.position.set(0, 20, 0);
	scene.add(fillLight);

	let car;
	const fbxLoader = new FBXLoader();
	fbxLoader
		.loadAsync("../assets/f1_carog.fbx", (xhr) => {
			console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
		})
		.then((object) => {
			car = object;
			car.position.x -= 10;
			//car.position.y += 1.4;
			car.position.y -= car.scale.y / 2 - 1;
			car.scale.x = 0.5;
			car.scale.y = 0.5;
			car.scale.z = 0.5;
			scene.add(car);
			console.log(car);

			car.children.forEach(function (child) {
				if (child.isGroup && child.name.startsWith("wheel")) {
					const mesh = child.children[0].children[0];
					console.log(mesh);
					wheels.push(mesh);
				}
			});
		})
		.catch(console.log);

	function animate(timestamp) {
		requestAnimationFrame(animate);
		//showcaseFloor.translateY(1);
		let t = timestamp * 0.01;
		roughnessMap.offset.set(0, -(t % 1));
		normalMap.offset.set(0, -(t % 1));

		rings.forEach((ring, i) => {
			let x = (i - 7) * 7 + ((timestamp * 0.02) % 3.5) * 2;
			let dist = Math.abs(x);
			ring.position.set(x, 0, 0);
			//ring.scale.set(1 - dist * 0.1, 1 - dist * 0.1, 1 - dist * 0.1);
			ring.scale.set(5.5, 5.5, 5.5);
			let colorScale = 1;
			if (dist > 2) {
				colorScale = 1 - (Math.min(dist, 12) - 2) / 20;
			}
			//colorScale *= 0.5;

			if (i % 2 == 1) {
				ring.material.emissive = new THREE.Color(0xff233b).multiplyScalar(colorScale);
			} else {
				ring.material.emissive = new THREE.Color(0xb65419).multiplyScalar(colorScale);
			}
		});
		if (car) {
			for (let i = 0; i < wheels.length; i++) {
				let wheel = wheels[i];
				wheel.rotation.y += 0.1;
			}
		}
		composer.render();
		//renderer.render(scene, camera);
	}

	function degrees_to_radians(degrees) {
		var pi = Math.PI;
		return degrees * (pi / 180);
	}

	function resizeCanvasToDisplaySize() {
		const canvas = renderer.domElement;
		// look up the size the canvas is being displayed
		const pixelRatio = window.devicePixelRatio;
		const width = (canvas.clientWidth * pixelRatio) | 0;
		const height = Math.min((canvas.clientHeight * pixelRatio) | 0, maxHeight);
		const needResize = canvas.width !== width || canvas.height !== height;

		if (needResize) {
			// pass false here or three.js fights browser
			renderer.setSize(width, height, false);
			composer.setSize(width, height);
		}

		camera.aspect = width / height;
		camera.updateProjectionMatrix();

		// update any render target sizes here
	}

	const resizeObserver = new ResizeObserver(resizeCanvasToDisplaySize);
	resizeObserver.observe(canvas, { box: "content-box" });

	animate();
})();
