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
function setup() {
    let prism_color = color(255);
    prism = new Prism(0, 0, 0, 0, prism_color);

    colorMode(HSB);

    let number_of_rays = 7;
    exit_rays = [];
    for (let index = 0; index < number_of_rays; index++) {
        let hue = index / number_of_rays * 255;
        let saturation = 255;
        let brightness = 255;
        let ray_color = color(hue, saturation, brightness);
        let start = createVector(0, 0);
        let end = createVector(0, 0);
        let ray = new Ray(start, end, ray_color);
        exit_rays.push(ray);
    }

    colorMode(RGB);

    createCanvas(windowWidth, windowHeight);
    canvas_updated();
}

function draw() {
    draw_debug_stuff = false;

    // Background
    background(0);

    // Entry ray
    strokeWeight(8);
    stroke(255);
    line(0, rays_edges_y, entry_ray_intersection.x, entry_ray_intersection.y);

    // Exit rays
    exit_rays.forEach((exit_ray) => {
        exit_ray.draw();
    });

    // Prism
    prism.draw();

    // Inner triangle
    noStroke();
    fill(255, 50);
    triangle(entry_ray_intersection.x, entry_ray_intersection.y, prism_exit_zone_start.x, prism_exit_zone_start.y, prism_exit_zone_end.x, prism_exit_zone_end.y);

    // Debug stuff
    if (draw_debug_stuff) {
        // Intersection lines
        stroke(255, 50);
        line(0, rays_edges_y, 10000, rays_edges_y);
        line(0, rays_intersection_y, 10000, rays_intersection_y);

        // Prism exit zone
        stroke(0, 255, 0);
        line_vectors(prism_exit_zone_start, prism_exit_zone_end);

        noStroke();
        fill(255, 0, 0);
        some_samples = samples_across_vectors(prism_exit_zone_start, prism_exit_zone_end, 10);
        some_samples.forEach((sample) => {
            circle(sample.x, sample.y, 5);
        });

        // Edge exit zone
        stroke(255, 0, 0);
        line_vectors(edge_exit_zone_start, edge_exit_zone_end);
    }
}

function canvas_updated() {
    // Calculate canvas center
    canvas_center_x = width / 2;
    canvas_center_y = height / 2;

    // Prism
    prism_height = height / 2;
    prism.center_x = canvas_center_x;
    prism.center_y = canvas_center_y;
    prism.height = prism_height;
    prism.width = prism_height / (sqrt(3) / 2);

    // Rays
    rays_edges_y = prism.center_y + prism_height * 0.3;
    rays_intersection_y = prism.center_y - prism_height * 0.04;

    o = (prism.bottom - rays_intersection_y);
    a = o / tan(PI / 3);

    entry_ray_intersection = createVector(prism.left + a, rays_intersection_y);

    top_vector = createVector(prism.center_x, prism.top);
    right_vector = createVector(prism.right, prism.bottom);

    exit_rays_center = createVector(prism.right - a, rays_intersection_y);
    exit_rays_zone_size = prism.height * 0.0004;
    prism_exit_zone_start = p5.Vector.lerp(top_vector, exit_rays_center, 1 - exit_rays_zone_size);
    prism_exit_zone_end = p5.Vector.lerp(top_vector, exit_rays_center, 1 + exit_rays_zone_size);

    edge_exit_zone_height = prism.height * 0.3;
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

function line_vectors(vector1, vector2) {
    line(vector1.x, vector1.y, vector2.x, vector2.y);
}

function samples_across_vectors(vector1, vector2, count) {
    samples = [];

    for (let i = 0; i < count; i++) {
        sample = p5.Vector.lerp(vector1, vector2, i / (count - 1));
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
        line_vectors(this.start_point, this.end_point);
    }
}
