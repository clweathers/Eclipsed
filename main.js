let exit_rays;
let prism;

let rays_edges_y;
let rays_prism_intersection_y;

let entry_ray_intersection;

let prism_exit_zone_start;
let prism_exit_zone_end;

let edge_exit_zone_start;
let edge_exit_zone_end;

let prism_exit_zone_samples;
let edge_exit_zone_samples;

let particle_pool;

// The zone on the right side of the prism where the particles emit.
let particle_start_zone_bottom;
let particle_start_zone_top;

// The zone on the right edge of the window where the particles head toward.
let particle_end_zone_bottom;
let particle_end_zone_top;

const reference_width = 1900;
const reference_height = 500;
const reference_aspect_ratio = reference_width / reference_height;

let focus_zone_x = 0;
let focus_zone_y = 0;
let focus_zone_width = 0;
let focus_zone_height = 0;

let scale_factor = 0;

let debug_mode = false;

function setup() {
    colorMode(HSL, 255);

    let prism_color = color(255);
    prism = new Prism(0, 0, 0, 0, prism_color);

    let number_of_rays = 30;
    exit_rays = [];
    for (let index = 0; index < number_of_rays; index++) {
        let hue = index / number_of_rays * 255;
        let saturation = 255;
        let lightness = 128;
        let ray_color = color(hue, saturation, lightness);
        let start = createVector(0, 0);
        let end = createVector(0, 0);
        let ray = new Ray(start, end, ray_color);
        exit_rays.push(ray);
    }

    particle_pool = new ParticlePool();
    particle_pool.setAllocateNewParticleFunction(() => {
        let particle = new Particle();
        return particle;
    });
    particle_pool.setParticleIsReadyForReuseFunction((particle) => {
        let particleIsReadyForReuse = particle.is_dead;
        return particleIsReadyForReuse;
    });
    particle_pool.preAllocate(600);

    particle_start_zone_bottom = createVector(0, 0);
    particle_start_zone_top = createVector(0, 0);
    particle_end_zone_bottom = createVector(0, 0);
    particle_end_zone_top = createVector(0, 0);

    createCanvas(windowWidth, windowHeight);
    canvas_updated();
}

function draw() {
    // Background
    background(0);

    if (debug_mode) {
        draw_focus_zone();
    }

    // Entry ray
    push();
    strokeWeight(8 * scale_factor);
    stroke(255);
    line(0, rays_edges_y, entry_ray_intersection.x, entry_ray_intersection.y);
    pop();

    // Exit rays
    // exit_rays.forEach((exit_ray) => {
    //     exit_ray.draw();
    // });

    // Particles
    push();
    noStroke();

    let should_activate_new_particle = random() > 0.1;
    if (should_activate_new_particle) {
        let particles_to_create = 2;
        for (let particle_index = 0; particle_index < particles_to_create; particle_index++) {
            particle_pool.activateNewParticle((particle) => {
                let exit_ray = random(exit_rays);
                particle.position = exit_ray.start_point.copy();
                particle.velocity = p5.Vector.sub(exit_ray.end_point, exit_ray.start_point);
                particle.velocity.setMag(random(2.9, 3.9) * scale_factor);
                particle.target_color = exit_ray.color;
                particle.fadeout_duration = random(800, 1200) * scale_factor;
                particle.cooldown_duration = random(900, 1300) * scale_factor;
                particle.max_age = random(4500, 6000) * scale_factor;
                particle.birth_time = millis();
    
                //particle.headingSpread = 0;                                     // Perfect lines
                //particle.headingSpread = randomGaussian(0, 0.02) * PI / 30000;  // Subtle taper at the end
                particle.headingSpread = randomGaussian(0, PI / 24) / 20000;  // Subtle taper at the end
                particle.headingSpread = randomGaussian(0, PI / 30) / 20000;  // Subtle taper at the end
                //particle.headingSpread = randomGaussian(0, 0.02) * PI / 2000;   // Like confetti blowing around a fan
            });
        }
    }

    particle_pool.forEach((particle) => {
        particle.update();
        particle.draw();
    });

    pop();

    // Prism
    push();
    prism.draw();
    pop();

    // Inner triangle
    push();
    noStroke();
    fill(255, 20);
    triangle(entry_ray_intersection.x, entry_ray_intersection.y, prism_exit_zone_start.x, prism_exit_zone_start.y, prism_exit_zone_end.x, prism_exit_zone_end.y);
    pop();

    // Leftover debug stuff that currently doesn't work...
    if (false) {
        // Intersection lines
        stroke(255, 50);
        line(0, rays_edges_y, 10000, rays_edges_y);
        line(0, rays_intersection_y, 10000, rays_intersection_y);

        // Prism exit zone
        stroke(0, 255, 0);
        draw_line_between_vectors(prism_exit_zone_start, prism_exit_zone_end);

        noStroke();
        fill(255, 0, 0);
        some_samples = samples_across_vectors(prism_exit_zone_start, prism_exit_zone_end, 10);
        some_samples.forEach((sample) => {
            circle(sample.x, sample.y, 5);
        });

        // Edge exit zone
        stroke(255, 0, 0);
        draw_line_between_vectors(edge_exit_zone_start, edge_exit_zone_end);
    }

    if (debug_mode) {
        draw_particle_zones();
        display_debug_info();
    }
}

function canvas_updated() {
    // Canvas center
    const canvas_center_x = width / 2;
    const canvas_center_y = height / 2;

    // Focus zone
    const landscapeOrientation = (width / height > reference_aspect_ratio);
    if (landscapeOrientation) {
        focus_zone_width = round(height * reference_aspect_ratio);
        focus_zone_height = height;
        focus_zone_x = round((width - focus_zone_width) / 2.0);
        focus_zone_y = 0;
        scale_factor = focus_zone_height / reference_height;
    }
    else {
        focus_zone_width = width;
        focus_zone_height = round(width / reference_aspect_ratio);
        focus_zone_x = 0;
        focus_zone_y = round((height - focus_zone_height) / 2.0);
        scale_factor = focus_zone_width / reference_width;
    }

    // Prism
    const prism_height = focus_zone_height / 2;
    prism.center_x = canvas_center_x;
    prism.center_y = canvas_center_y;
    prism.height = prism_height;
    prism.width = prism_height / (sqrt(3) / 2);

    // Rays
    rays_edges_y = prism.center_y + prism_height * 0.3;
    rays_prism_intersection_y = prism.center_y - prism_height * 0.04;

    let o = (prism.bottom - rays_prism_intersection_y);
    let a = o / tan(PI / 3);

    entry_ray_intersection = createVector(prism.left + a, rays_prism_intersection_y);

    let top_vector = createVector(prism.center_x, prism.top);
    let right_vector = createVector(prism.right, prism.bottom);

    let exit_rays_center = createVector(prism.right - a, rays_prism_intersection_y);
    let exit_rays_zone_size = prism.height * 0.001;
    prism_exit_zone_start = p5.Vector.lerp(top_vector, exit_rays_center, 1 - exit_rays_zone_size);
    prism_exit_zone_end = p5.Vector.lerp(top_vector, exit_rays_center, 1 + exit_rays_zone_size);

    let edge_exit_zone_height = prism.height * 0.4;
    edge_exit_zone_start = createVector(width, rays_edges_y - (edge_exit_zone_height / 2));
    edge_exit_zone_end = createVector(width, rays_edges_y + (edge_exit_zone_height / 2));

    prism_exit_zone_samples = samples_across_vectors(prism_exit_zone_start, prism_exit_zone_end, exit_rays.length);
    edge_exit_zone_samples = samples_across_vectors(edge_exit_zone_start, edge_exit_zone_end, exit_rays.length);

    exit_rays.forEach((exit_ray, index) => {
        exit_ray.start_point = prism_exit_zone_samples[index];
        exit_ray.end_point = edge_exit_zone_samples[index];
    });

    // Particle start zone (where the particles emit)

    // Particle end zone (where the particles head towards)
    const particle_end_zone_height = prism.height * 0.4;
    const particle_end_zone_x = width;
    const particle_end_zone_center_y = prism.center_y + prism_height * 0.3;

    particle_end_zone_top.x = particle_end_zone_x;
    particle_end_zone_top.y = particle_end_zone_center_y - (particle_end_zone_height / 2);

    particle_end_zone_bottom.x = particle_end_zone_x;
    particle_end_zone_bottom.y = particle_end_zone_center_y + (particle_end_zone_height / 2);
}

// Resize handling

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    canvas_updated();
}

// Keyboard

function keyPressed() {
    if (key === 'd' || key === 'D') {
        debug_mode = !debug_mode;
    }
}

// Utility functions

function draw_line_between_vectors(vector1, vector2) {
    line(vector1.x, vector1.y, vector2.x, vector2.y);
}

function samples_across_vectors(vector1, vector2, count) {
    let samples = [];

    for (let i = 0; i < count; i++) {
        let sample = p5.Vector.lerp(vector1, vector2, i / (count - 1));
        samples.push(sample);
    }

    return samples;
}

// Debug functions

function draw_focus_zone() {
    push();

    fill(30);
    rect(focus_zone_x, focus_zone_y, focus_zone_width, focus_zone_height);

    pop();
}

function draw_particle_zones() {
    push();

    stroke(255, 255, 128);
    strokeWeight(4);

    draw_line_between_vectors(particle_start_zone_top, particle_start_zone_bottom);
    draw_line_between_vectors(particle_end_zone_top, particle_end_zone_bottom);

    pop();
}

function display_debug_info() {
    let window_dimensions_string = "";
    window_dimensions_string = `window:\n w: ${width}\n h: ${height}\n\n`;

    let focus_zone_string = "";
    focus_zone_string = `focus zone:\n x: ${focus_zone_x}\n y: ${focus_zone_y}\n w: ${focus_zone_width}\n h: ${focus_zone_height}\n\n`;

    let particle_status_string = "";
    particle_status_string = `particles:\n ${particle_pool.poolStatusString()}\n\n`;

    const debug_info_string = `${window_dimensions_string}${focus_zone_string}${particle_status_string}`;

    push();
    
    fill(255);
    textAlign(LEFT, TOP);
    textFont("Menlo");
    text(debug_info_string, 0, 0);

    pop();
}

// Classes

class Prism {
    constructor(center_x, center_y, height, width, color) {
        this.center_x = center_x;
        this.center_y = center_y;
        this.height = height;
        this.width = width;
        this.color = color;
    }

    draw() {
        push();

        fill(0);
        stroke(this.color);
        strokeWeight(4 * scale_factor);
        triangle(this.left, this.bottom, this.center_x, this.top, this.right, this.bottom);

        pop();
    }

    get bottom() {
        return this.center_y + this.height / 2;
    }

    get top() {
        return this.center_y - this.height / 2;
    }

    get left() {
        return this.center_x - this.width / 2;
    }

    get right() {
        return this.center_x + this.width / 2;
    }
}

class Ray {
    constructor(start_point, end_point, color) {
        this.start_point = start_point;
        this.end_point = end_point;
        this.color = color;
    }

    draw() {
        stroke(this.color);
        strokeWeight(20);
        draw_line_between_vectors(this.start_point, this.end_point);
    }
}

class Particle {
    constructor() {
        //this.position = createVector(0, 0);
        //this.velocity = createVector(0, 0);
        //this.target_color = color(0);
        //this.fadeout_duration = 0;
        //this.cooldown_duration = 0;
        //this.max_age = 0;
        //this.birth_time = millis();

        this.friction = 0.11;
    }

    update() {
        // Apply friction to velocity
        var frictionVelocityDelta = this.friction / deltaTime;
        frictionVelocityDelta = max(frictionVelocityDelta, 0);
        this.velocity.setMag(this.velocity.mag() - frictionVelocityDelta);

        this.velocity.setHeading(this.velocity.heading() + (this.headingSpread * this.age * 0.07));
        
        this.position.add(this.velocity);
    }

    draw() {
        let cooldown_fraction = norm(this.age, 0, this.cooldown_duration);
        let fadeout_start_age = this.max_age - this.fadeout_duration;
        let fadeout_fraction = norm(this.age, fadeout_start_age, this.max_age);

        let h = hue(this.target_color);
        let s = saturation(this.target_color);
        let l = map(cooldown_fraction, 0, 1, 255, 128, true);
        let a = map(fadeout_fraction, 0, 1, 255, 0, true);
        let current_color = color(h, s, l, a);
        
        fill(current_color);
        circle(this.position.x, this.position.y, 4 * scale_factor);
    }

    get age() {
        return millis() - this.birth_time;
    }

    get is_dead() {
        return this.age > this.max_age;
    }
}
