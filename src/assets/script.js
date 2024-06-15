import './style.css';
import * as THREE from 'three';

let particlesEnabled = false;

document.addEventListener("DOMContentLoaded", function () {
	if (!particlesEnabled) {
		return;
	}
	const canvas = document.createElement("canvas");
	canvas.id = "particles";
	document.body.prepend(canvas);

	const ctx = canvas.getContext("2d");

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	let particles = [];
	const particle_density = 5e-6;
	let num_particles;

	const particle_size = 2;
	const avoidance_radius = 48;

	let mouse = {
		x: null,
		y: null,
	};

	let animation_frame_id = null;

	function update_pointer(e) {
		if (e.touches) {
			mouse.x = e.touches[0].clientX;
			mouse.y = e.touches[0].clientY;
		} else {
			mouse.x = e.clientX;
			mouse.y = e.clientY;
		}
	}

	window.addEventListener("mousemove", update_pointer);
	window.addEventListener("touchmove", update_pointer);

	function debounce(func, wait, immediate) {
		let timeout;
		return function () {
			let context = this,
				args = arguments;
			let later = function () {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			let call_now = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (call_now) func.apply(context, args);
		};
	}

	function handle_resize() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		cancelAnimationFrame(animation_frame_id);
		init();
		animate();
	}

	window.addEventListener("resize", debounce(handle_resize, 250));

	class Particle {
		constructor() {
			this.reset();
		}

		reset() {
			this.x = Math.random() * canvas.width;
			this.y = Math.random() * canvas.height;
			this.velocity = {
				x: (Math.random() - 0.5) * 2,
				y: (Math.random() - 0.5) * 2,
			};
		}

		update(particles) {
			if (this.x <= 0 || this.x >= canvas.width) {
				this.velocity.x *= -1;
				this.x = Math.max(Math.min(this.x, canvas.width), 0);
			}

			if (this.y <= 0 || this.y >= canvas.height) {
				this.velocity.y *= -1;
				this.y = Math.max(Math.min(this.y, canvas.height), 0);
			}

			let dx = mouse.x - this.x;
			let dy = mouse.y - this.y;
			let distance = Math.sqrt(dx * dx + dy * dy);

			if (distance < avoidance_radius && distance > 0) {
				this.velocity.x += (dx / distance) * 0.5;
				this.velocity.y += (dy / distance) * 0.5;
			}

			particles.forEach((p) => {
				if (p !== this) {
					let dx = p.x - this.x;
					let dy = p.y - this.y;
					let distance = Math.sqrt(dx * dx + dy * dy);
					if (distance < 2 * particle_size && distance > 0) {
						let collision_normal = {
							x: dx / distance,
							y: dy / distance,
						};
						let relative_velocity = {
							x: this.velocity.x - p.velocity.x,
							y: this.velocity.y - p.velocity.y,
						};
						let speed =
							relative_velocity.x * collision_normal.x +
							relative_velocity.y * collision_normal.y;

						if (speed < 0) {
							let impulse = (2 * speed) / 2;
							this.velocity.x -= impulse * collision_normal.x;
							this.velocity.y -= impulse * collision_normal.y;
							p.velocity.x += impulse * collision_normal.x;
							p.velocity.y += impulse * collision_normal.y;
						}
					}
				}
			});

			this.x += this.velocity.x;
			this.y += this.velocity.y;
		}

		draw() {
			ctx.beginPath();
			ctx.arc(this.x, this.y, particle_size, 0, Math.PI * 2);
			ctx.fillStyle = currentThemeSetting === "dark" ? "white" : "red";
			ctx.fill();

			particles.forEach((p) => {
				let dx = p.x - this.x;
				let dy = p.y - this.y;
				let distance = Math.sqrt(dx * dx + dy * dy);

				if (distance < 1020) {
					ctx.beginPath();
					ctx.moveTo(this.x, this.y);
					ctx.lineTo(p.x, p.y);
					ctx.strokeStyle = currentThemeSetting === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 0, 0, 0.1)";
					ctx.stroke();
				}
			});
		}
	}

	function init() {
		particles = [];
		num_particles = Math.floor(
			particle_density * canvas.width * canvas.height,
		);
		num_particles = Math.min(num_particles, 1024);
		for (let i = 0; i < num_particles; i++) {
			particles.push(new Particle());
		}
	}

	function animate() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		particles.forEach((particle) => {
			particle.update(particles);
			particle.draw();
		});
		animation_frame_id = requestAnimationFrame(animate);
	}

	init();
	animate();
});









function calculateSettingAsThemeString({ localStorageTheme, systemSettingDark }) {
	if (localStorageTheme !== null) {
		return localStorageTheme;
	}

	if (systemSettingDark.matches) {
		return "dark";
	}

	return "light";
}

function updateButton({ buttonEl, isDark }) {
	const newCta = isDark ? "Toggle dark mode" : "Toggle light mode";
	buttonEl.setAttribute("aria-label", newCta);
	buttonEl.innerHTML = `<i class="theme-icon bi ${isDark ? 'bi-moon' : 'bi-sun'}"></i>`;
}

function updateThemeOnHtmlEl({ theme }) {
	document.querySelector("html").setAttribute("data-theme", theme);
}

const button = document.querySelector("[data-theme-toggle]");
const localStorageTheme = localStorage.getItem("theme");
const systemSettingDark = window.matchMedia("(prefers-color-scheme: dark)");

let currentThemeSetting = calculateSettingAsThemeString({ localStorageTheme, systemSettingDark });

updateButton({ buttonEl: button, isDark: currentThemeSetting === "dark" });
updateThemeOnHtmlEl({ theme: currentThemeSetting });

button.addEventListener("click", (event) => {
	const newTheme = currentThemeSetting === "dark" ? "light" : "dark";

	localStorage.setItem("theme", newTheme);
	updateButton({ buttonEl: button, isDark: newTheme === "dark" });
	updateThemeOnHtmlEl({ theme: newTheme });

	currentThemeSetting = newTheme;
});



// Three.js Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
	canvas: document.querySelector('#donut'),
	alpha: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);
camera.position.setX(-3);
renderer.render(scene, camera);

// Solar System
const solarSystem = new THREE.Object3D();
scene.add(solarSystem);

// Sun
const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunTexture = new THREE.TextureLoader().load('/assets/img/sun.jpg');
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
solarSystem.add(sun);

// Earth
const earthOrbit = new THREE.Object3D();
earthOrbit.position.set(10, 0, 0);
solarSystem.add(earthOrbit);

const earthGeometry = new THREE.SphereGeometry(2, 32, 32);
const earthTexture = new THREE.TextureLoader().load('/assets/img/earth.jpg');
const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earthOrbit.add(earth);

// Moon
const moonOrbit = new THREE.Object3D();
moonOrbit.position.set(4, 0, 0);
earth.add(moonOrbit);

const moonGeometry = new THREE.SphereGeometry(1, 32, 32);
const moonTexture = new THREE.TextureLoader().load('./assets/img/moon.jpg');
const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture });
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
moonOrbit.add(moon);

// Lights
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Mouse Interaction
let isDragging = false;
let previousMousePosition = {
	x: 0,
	y: 0
};

function onMouseMove(event) {
	const deltaMove = {
		x: event.clientX - previousMousePosition.x,
		y: event.clientY - previousMousePosition.y
	};

	if (isDragging) {
		const deltaRotationQuaternion = new THREE.Quaternion()
			.setFromEuler(new THREE.Euler(
				toRadians(deltaMove.y * 1),
				toRadians(deltaMove.x * 1),
				0,
				'XYZ'
			));

		solarSystem.quaternion.multiplyQuaternions(deltaRotationQuaternion, solarSystem.quaternion);
	}

	previousMousePosition = {
		x: event.clientX,
		y: event.clientY
	};
}

function onMouseDown(event) {
	isDragging = true;
	previousMousePosition = {
		x: event.clientX,
		y: event.clientY
	};
}

function onMouseUp(event) {
	isDragging = false;
}

function toRadians(angle) {
	return angle * (Math.PI / 180);
}

window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mousedown', onMouseDown);
window.addEventListener('mouseup', onMouseUp);

function animate() {
	requestAnimationFrame(animate);
	solarSystem.rotation.y += 0.01; // Rotate the solar system
	earthOrbit.rotation.y += 0.02; // Rotate the earth orbit
	moonOrbit.rotation.y += 0.03; // Rotate the moon orbit

	renderer.render(scene, camera);
}

animate();
