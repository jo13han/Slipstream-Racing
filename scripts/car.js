import * as THREE from "https://cdn.skypack.dev/three@0.132.2";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/FBXLoader";
const canvas = document.querySelector(".car");
const maxHeight = Number(canvas.getAttribute("data-max-height").replace("px", ""));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 1, 50);
camera.position.z = 10;
camera.position.y = 2;
const wheels = [];

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setClearColor(0x000000, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableDamping = false;
controls.campingFactor = 0.25;
controls.enableZoom = false;
controls.minDistance = 13;
controls.maxDistance = 13;
controls.minPolarAngle = degrees_to_radians(67);
controls.maxPolarAngle = degrees_to_radians(67);
controls.update();
//controls.target.add(new THREE.Vector3(0, 0, 2));

let showcaseFloor = new THREE.Mesh(
	new THREE.CylinderGeometry(5.4, 5.4, 0.12, 80),
	new THREE.MeshBasicMaterial({ color: 0xff233b })
);
showcaseFloor.position.y = -0.5;
showcaseFloor.receiveShadow = true;
scene.add(showcaseFloor);

let showcaseFloor2 = new THREE.Mesh(
	new THREE.CylinderGeometry(4.9, 4.9, 0.13, 80),
	new THREE.MeshBasicMaterial({ color: 0x282828 })
);
showcaseFloor2.position.y = -0.5;
showcaseFloor2.receiveShadow = true;
scene.add(showcaseFloor2);

let showcaseFloor3 = new THREE.Mesh(
	new THREE.CylinderGeometry(8, 8, 0.11, 80),
	new THREE.MeshBasicMaterial({ color: 0x282828 })
);
showcaseFloor3.position.y = -0.5;
showcaseFloor3.receiveShadow = true;
scene.add(showcaseFloor3);

let showcaseFloor4 = new THREE.Mesh(
	new THREE.CylinderGeometry(8.2, 8.2, 0.1, 80),
	new THREE.MeshBasicMaterial({ color: 0xff233b })
);
showcaseFloor4.position.y = -0.5;
showcaseFloor4.receiveShadow = true;
scene.add(showcaseFloor4);

let keyLight = new THREE.DirectionalLight(new THREE.Color("hsl(30, 100%, 75%)"), 1.0);
keyLight.position.set(-100, 0, 100);

let fillLight = new THREE.DirectionalLight(new THREE.Color("hsl(240, 100%, 75%)"), 0.75);
fillLight.position.set(100, 0, 100);

let backLight = new THREE.DirectionalLight(0xffffff, 0.5);
backLight.position.set(100, 0, -100).normalize();

let topLight = new THREE.DirectionalLight(0xffffff, 0.5);
topLight.position.set(0, 100, 0).normalize();

scene.add(topLight);
scene.add(keyLight);
scene.add(fillLight);
scene.add(backLight);

let car;
const fbxLoader = new FBXLoader();
fbxLoader
	.loadAsync(`${window.location.pathname}assets/f1_carog.fbx`, (xhr) => {
		console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
	})
	.then((object) => {
		car = object;

		car.position.x -= 6.5;
		car.position.y += 0.1;
		//car.position.y += car.scale.y;
		car.scale.x = 0.25;
		car.scale.y = 0.25;
		car.scale.z = 0.25;
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
function animate() {
	requestAnimationFrame(animate);
	if (car) {
		for (let i = 0; i < wheels.length; i++) {
			let wheel = wheels[i];
			wheel.rotation.y += 0.1;
		}
	}
	renderer.render(scene, camera);
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
		// you must pass false here or three.js sadly fights the browser
		renderer.setSize(width, height, false);
	}

	camera.aspect = width / height;
	camera.updateProjectionMatrix();

	// update any render target sizes here
}

const resizeObserver = new ResizeObserver(resizeCanvasToDisplaySize);
resizeObserver.observe(canvas, { box: "content-box" });

animate();
