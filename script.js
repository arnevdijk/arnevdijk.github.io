      /*
 * @licstart The following is the entire license notice for the JavaScript code in this file.
 *
 * Copyright (C) 2024 Ari Archer
 *
 * This file is part of ari.lt.
 *
 * The JavaScript code in this file is free software: you can redistribute it
 * and/or modify it under the terms of the GNU Affero General Public License
 * (AGPL) as published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version. The code is distributed WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.
 *
 * As additional permission under AGPL version 3 section 7, you may distribute non-source
 * (e.g., minimized or compacted) forms of that code without the copy of the AGPL normally
 * required by section 4, provided you include this license notice and a URL through which
 * recipients can access the Corresponding Source.
 *
 * @licend The above is the entire license notice for the JavaScript code in this file.
 */

        "use strict";

        document.addEventListener("DOMContentLoaded", function () {
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


        /**
* Utility function to calculate the current theme setting.
* Look for a local storage value.
* Fall back to system setting.
* Fall back to light mode.
*/
function calculateSettingAsThemeString({ localStorageTheme, systemSettingDark }) {
    if (localStorageTheme !== null) {
      return localStorageTheme;
    }
  
    if (systemSettingDark.matches) {
      return "dark";
    }
  
    return "light";
  }
  
  /**
  * Utility function to update the button text and aria-label.
  */
function updateButton({ buttonEl, isDark }) {
    const newCta = isDark ? "Toggle dark mode" : "Toggle light mode";
    buttonEl.setAttribute("aria-label", newCta);
    buttonEl.innerHTML = `
        <i class="theme-icon bi ${isDark ? 'bi-moon' : 'bi-sun'}"></i>
    `;
}

/**
* Utility function to update the theme setting on the html tag
*/
  function updateThemeOnHtmlEl({ theme }) {
    document.querySelector("html").setAttribute("data-theme", theme);
  }
  
  
  /**
  * On page load:
  */
  
  /**
  * 1. Grab what we need from the DOM and system settings on page load
  */
  const button = document.querySelector("[data-theme-toggle]");
  const localStorageTheme = localStorage.getItem("theme");
  const systemSettingDark = window.matchMedia("(prefers-color-scheme: dark)");
  
  /**
  * 2. Work out the current site settings
  */
  let currentThemeSetting = calculateSettingAsThemeString({ localStorageTheme, systemSettingDark });
  
  /**
  * 3. Update the theme setting and button text accoridng to current settings
  */
  updateButton({ buttonEl: button, isDark: currentThemeSetting === "dark" });
  updateThemeOnHtmlEl({ theme: currentThemeSetting });
  
  /**
  * 4. Add an event listener to toggle the theme
  */
  button.addEventListener("click", (event) => {
    const newTheme = currentThemeSetting === "dark" ? "light" : "dark";
  
    localStorage.setItem("theme", newTheme);
    updateButton({ buttonEl: button, isDark: newTheme === "dark" });
    updateThemeOnHtmlEl({ theme: newTheme });
  
    currentThemeSetting = newTheme;
  }); 