let ray;
let ray2;
let ray3;

function setup() {
    let x1 = 100;
    let x2 = 800;
    let y = 100;
    let yStep = 10;

    rayColor = color(255, 0, 0);
    ray = new Ray(rayColor, x1, y, x2, y, 1);

    y = y + yStep;
    rayColor = color(0, 255, 0);
    ray2 = new Ray(rayColor, x1, y, x2, y, 2);

    y = y + yStep;
    rayColor = color(0, 0, 255);
    ray3 = new Ray(rayColor, x1, y, x2, y, 3);

    createCanvas(windowWidth, windowHeight);
    canvas_updated();
}

function draw() {
    background(0);

    push();
    blendMode(SCREEN);
    ray.draw();
    ray2.draw();
    ray3.draw();
    pop();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    canvas_updated();
}

function canvas_updated() {
    
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
