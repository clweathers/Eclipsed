let entry_ray;
let exit_rays;
let internal_rays;
let prism;

let rays_edge_y;
let rays_prism_intersection_y;

let entry_ray_intersection_x;
let entry_ray_intersection_y;

function setup() {
    let prism_color = color(255);
    prism = new Prism(0, 0, 0, 0, prism_color);

    createCanvas(windowWidth, windowHeight);
    canvas_updated();
}

function draw() {
    draw_debug_stuff = false;

    // Background
    background(0);

    // Entry ray
    strokeWeight(10);
    line(0, rays_edges_y, entry_ray_intersection_x, entry_ray_intersection_y);

    // Prism
    prism.draw();

    // Debug stuff
    if (draw_debug_stuff) {
        line(0, rays_edges_y, 10000, rays_edges_y);
        line(0, rays_intersection_y, 10000, rays_intersection_y);

        noFill();
        circle(entry_ray_intersection_x, entry_ray_intersection_y, 10);
    }

    

    // push();
    // blendMode(SCREEN);
    // ray.draw();
    // ray2.draw();
    // ray3.draw();
    // pop();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    canvas_updated();
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
}

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
    constructor(color, x1, y1, x2, y2, seed) {
        this.color = color;
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
        this.seed = seed;
    }

    draw() {
        noFill();
        stroke(this.color);
        strokeWeight(8);

        beginShape();

        let steps = 50;

        noiseSeed(this.seed);

        let tShift = frameCount / 1000;

        for (let i = 0; i < steps; i++) {
            let a = float(i) / float(steps);
            let x = lerp(this.x1, this.x2, a);
            let y = lerp(this.y1, this.y2, a) + noise(x + tShift) * 200;

            curveVertex(x, y);
        }

        endShape();
    }
}
