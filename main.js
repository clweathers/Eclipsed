// Prism
let prism;

// Particle pool
let particle_pool;

// Entry ray
let entry_ray_start_point;
let entry_ray_end_point;

// Particle start zone
// (The zone on the right side of the prism where the particles emit from.)
let particle_start_zone_bottom;
let particle_start_zone_top;

// Particle end zone
// (The zone on the right edge of the window where the particles head toward.)
let particle_end_zone_bottom;
let particle_end_zone_top;

// Reference values
const reference_width = 1900;
const reference_height = 500;
const reference_aspect_ratio = reference_width / reference_height;
const minimum_aspect_ratio = 8 / 3;

// Focus zone
let focus_zone_x = 0;
let focus_zone_y = 0;
let focus_zone_width = 0;
let focus_zone_height = 0;

// Scaling
let scale_factor = 0;

// Debug
let debug_mode = false;

function setup() {
    colorMode(HSL, 255);

    // Prism
    const prism_color = color(255);
    prism = new Prism(0, 0, 0, 0, prism_color);

    // Particle pool
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

    // Entry ray points
    entry_ray_start_point = createVector(0, 0);
    entry_ray_end_point = createVector(0, 0);

    // Particle start and end zones
    particle_start_zone_bottom = createVector(0, 0);
    particle_start_zone_top = createVector(0, 0);
    particle_end_zone_bottom = createVector(0, 0);
    particle_end_zone_top = createVector(0, 0);

    // Canvas
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
    draw_entry_ray();

    // Particles
    draw_particles();

    // Prism
    prism.draw();

    // Inner triangle
    draw_inner_triangle();

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
    // TODO: There's some more work to do on the math in this section.
    const focus_zone_aspect_ratio = max(width / height, minimum_aspect_ratio);

    const landscape_orientation = (width / height > reference_aspect_ratio);
    if (landscape_orientation) {
        focus_zone_width = round(height * focus_zone_aspect_ratio);
        focus_zone_height = height;
        focus_zone_x = round((width - focus_zone_width) / 2.0);
        focus_zone_y = 0;
    }
    else {
        focus_zone_width = width;
        focus_zone_height = round(width / focus_zone_aspect_ratio);
        focus_zone_x = 0;
        focus_zone_y = round((height - focus_zone_height) / 2.0);
    }

    scale_factor = focus_zone_height / reference_height;

    // Prism
    const prism_height = focus_zone_height / 2;
    prism.center_x = canvas_center_x;
    prism.center_y = canvas_center_y;
    prism.height = prism_height;
    prism.width = prism_height / (sqrt(3) / 2);

    // Entry ray start point
    // (Amount is from the top to the bottom)
    const entry_ray_start_point_amount = 0.6;
    entry_ray_start_point.x = 0;
    entry_ray_start_point.y = entry_ray_start_point_amount;
    entry_ray_start_point.y = lerp(focus_zone_y, focus_zone_y + focus_zone_height, entry_ray_start_point_amount);

    // Entry ray end point
    // (The point where the entry ray intersects the left side of the prism.)
    // (Amount is from the top to the bottom)
    const entry_ray_end_point_amount = 0.48;
    entry_ray_end_point.x = lerp(prism.center_x, prism.left, entry_ray_end_point_amount);
    entry_ray_end_point.y = lerp(prism.top, prism.bottom, entry_ray_end_point_amount);

    // Particle start zone
    // (Where the particles emit from)
    // (Amounts are from the top to the bottom)
    const particle_start_zone_top_amount = 0.34;
    const particle_start_zone_bottom_amount = 0.57;

    particle_start_zone_top.x = lerp(prism.center_x, prism.right, particle_start_zone_top_amount);
    particle_start_zone_top.y = lerp(prism.top, prism.bottom, particle_start_zone_top_amount);

    particle_start_zone_bottom.x = lerp(prism.center_x, prism.right, particle_start_zone_bottom_amount);
    particle_start_zone_bottom.y = lerp(prism.top, prism.bottom, particle_start_zone_bottom_amount);

    // Particle end zone
    // (Where the particles head towards)
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

// Draw functions

function draw_entry_ray() {
    push();

    strokeWeight(8 * scale_factor);
    stroke(255);

    draw_line_between_vectors(entry_ray_start_point, entry_ray_end_point);
    
    pop();
}

function draw_particles() {
    push();

    noStroke();

    let should_activate_new_particle = random() > 0.1;
    if (should_activate_new_particle) {
        let particles_to_create = 2;
        for (let particle_index = 0; particle_index < particles_to_create; particle_index++) {
            particle_pool.activateNewParticle((particle) => {
                const random_amount = random();
                const start_point = p5.Vector.lerp(particle_start_zone_top, particle_start_zone_bottom, random_amount);
                const end_point = p5.Vector.lerp(particle_end_zone_top, particle_end_zone_bottom, random_amount);

                particle.position = start_point;
                particle.velocity = p5.Vector.sub(end_point, start_point);
                particle.velocity.setMag(random(2.9, 3.9) * scale_factor);
                particle.target_color = color(random_amount * 255, 255, 128);;
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
}

function draw_inner_triangle() {
    push();

    noStroke();
    fill(255, 20);

    triangle(entry_ray_end_point.x, entry_ray_end_point.y, particle_start_zone_top.x, particle_start_zone_top.y, particle_start_zone_bottom.x, particle_start_zone_bottom.y);

    pop();
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
    focus_zone_string = `focus zone:\n x: ${focus_zone_x}\n y: ${focus_zone_y}\n w: ${focus_zone_width}\n h: ${focus_zone_height}\n aspect_ratio: ${focus_zone_width / focus_zone_height}\n\n`;

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
