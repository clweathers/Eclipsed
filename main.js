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

let exit_particles;

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

    exit_particles = [];

    createCanvas(windowWidth, windowHeight);
    canvas_updated();
}

function draw() {
    draw_debug_stuff = false;

    // Background
    background(0);

    // Entry ray
    push();
    strokeWeight(8);
    stroke(255);
    line(0, rays_edges_y, entry_ray_intersection.x, entry_ray_intersection.y);
    pop();

    // Exit rays
    exit_rays.forEach((exit_ray) => {
        //exit_ray.draw();
    });

    // Exit particles
    push();
    noStroke();

    let should_create_particle = random() > 0.2;
    should_create_particle = true;
    if (should_create_particle) {
        let exit_ray = random(exit_rays);
        let particle = new Particle();
        particle.position = exit_ray.start_point.copy();
        particle.velocity = createVector(0.5, 0.5);
        particle.velocity.setMag(1.5 * random());
        particle.velocity.setHeading(exit_ray.end_point.angleBetween(exit_ray.start_point));
        particle.target_color = exit_ray.color;
        particle.fadeout_duration = 5000 * random();
        particle.cooldown_duration = 2000;
        particle.max_age = 7000 * random();
        exit_particles.push(particle);
    }

    exit_particles.forEach((exit_particle) => {
        exit_particle.update();
        exit_particle.draw();
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

    // Debug stuff
    if (draw_debug_stuff) {
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
}

function canvas_updated() {
    // Calculate canvas center
    let canvas_center_x = width / 2;
    let canvas_center_y = height / 2;

    // Prism
    let prism_height = height / 2;
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
}

// Resize handling

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    canvas_updated();
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
        fill(0);
        stroke(this.color);
        strokeWeight(4);
        triangle(this.left, this.bottom, this.center_x, this.top, this.right, this.bottom);
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
        this.position = createVector(0, 0);
        this.acceleration = createVector(0, 0);
        this.velocity = createVector(0, 0);
        this.target_color = color(0);
        this.fadeout_duration = 0;
        this.cooldown_duration = 0;
        this.max_age = 0;
        this.birth_time = millis();
    }

    update() {
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

        circle(this.position.x, this.position.y, 5);
    }

    get age() {
        return millis() - this.birth_time;
    }

    get is_dead() {
        return this.age > this.max_age;
    }
}
