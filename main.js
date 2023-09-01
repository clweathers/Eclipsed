let exit_rays;
let prism;

let rays_edge_y;
let rays_prism_intersection_y;

let entry_ray_intersection_x;
let entry_ray_intersection_y;

let prism_exit_zone_start;
let prism_exit_zone_end;

let edge_exit_zone_start;
let edge_exit_zone_end;

function setup() {
    let prism_color = color(255);
    prism = new Prism(0, 0, 0, 0, prism_color);

    colorMode(HSB);

    number_of_rays = 6;
    exit_rays = [];
    for (let index = 0; index < number_of_rays; index++) {
        hue = index / number_of_rays * 255;
        saturation = 255;
        brightness = 255;
        ray_color = color(hue, saturation, brightness);
        x = index * 10 + 10;
        start = createVector(x, 10);
        end = createVector(x, 100);
        ray = new Ray(start, end, ray_color);
        exit_rays.push(ray);
    }

    colorMode(RGB);

    createCanvas(windowWidth, windowHeight);
    canvas_updated();
}

function draw() {
    draw_debug_stuff = true;

    // Background
    background(0);

    // Entry ray
    strokeWeight(8);
    stroke(255);
    line(0, rays_edges_y, entry_ray_intersection_x, entry_ray_intersection_y);

    // Prism
    strokeWeight(4);
    prism.draw();

    // Inner triangle
    noStroke();
    fill(255, 50);
    triangle(entry_ray_intersection_x, entry_ray_intersection_y, prism_exit_zone_start.x, prism_exit_zone_start.y, prism_exit_zone_end.x, prism_exit_zone_end.y);

    // Exit rays
    exit_rays.forEach((exit_ray) => {
        exit_ray.draw();
    });

    // Debug stuff
    if (draw_debug_stuff) {
        // Intersection lines
        stroke(255, 50);
        line(0, rays_edges_y, 10000, rays_edges_y);
        line(0, rays_intersection_y, 10000, rays_intersection_y);

        // Prism exit zone
        stroke(0, 255, 0);
        line_vectors(prism_exit_zone_start, prism_exit_zone_end);
    }

    noStroke();
    fill(255, 0, 0);
    some_samples = samples_across_vectors(prism_exit_zone_start, prism_exit_zone_end, 10);
    some_samples.forEach((sample) => {
        circle(sample.x, sample.y, 5);
    });
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
    rays_edges_y = prism.center_y + prism_height * .2;
    rays_intersection_y = prism.center_y - prism_height * .01;

    o = (prism.bottom - rays_intersection_y);
    a = o / tan(PI / 3);

    entry_ray_intersection_x = prism.left + a;
    entry_ray_intersection_y = rays_intersection_y;

    top_vector = createVector(prism.center_x, prism.top);
    right_vector = createVector(prism.right, prism.bottom);

    prism_exit_zone_start = p5.Vector.lerp(top_vector, right_vector, 0.2);
    prism_exit_zone_end = p5.Vector.lerp(top_vector, right_vector, 0.5);

    edge_exit_zone_start = createVector(width - 10, 0);
    edge_exit_zone_end = createVector(width - 10, height);

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
        line_vectors(this.start_point, this.end_point);
    }
}
