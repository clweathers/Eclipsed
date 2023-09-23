class ParticlePool {

    // Setup and teardown

    constructor() {
        this.liveParticles = [];
        this.reusableParticles = [];
    }

    // Public methods

    // Pre-allocates the given number of particles to avoid needing to allocate them on the fly.
    preAllocate(length) {
        while (this.allParticles().length < length) {
            let particle = this.#allocateNewParticle();
            this.reusableParticles.push(particle);
        }
    }

    // Activates a new particle (either by reusing one or allocating a brand new one) and executes the given function on it to set it up.
    activateNewParticle(f) {
        let particle;

        let hasReusableParticleAvailable = (this.reusableParticles.length > 0);
        if (hasReusableParticleAvailable) {
            particle = this.reusableParticles.pop();
        }
        else {
            particle = this.#allocateNewParticle();
        }

        this.liveParticles.push(particle);

        f(particle);
    }

    // Iterate over all the live particles and execute the given function on each of them.
    // While iterating, this function also takes any particles ready for reuse and moves them into the reuse pool.
    forEach(f) {
        for (let i = this.liveParticles.length - 1; i >= 0; i--) {
            let particle = this.liveParticles[i];

            if (this.#particleIsReadyForReuse(particle)) {
                this.liveParticles.splice(i, 1);
                this.reusableParticles.push(particle);
                continue;
            }
            else {
                f(particle);
            }
        }
    }

    // Returns the combination of all live and reusable particles.
    allParticles() {
        let allParticles = this.liveParticles.concat(this.reusableParticles);
        return allParticles;
    }

    // Set the function that will be called anytime a brand new particle needs to be allocated.
    setAllocateNewParticleFunction(f) {
        this.#allocateNewParticle = f;
    }

    // Set the function that will be called to determine if a particle is ready to be moved out of the live particle pool and reused.
    setParticleIsReadyForReuseFunction(f) {
        this.#particleIsReadyForReuse = f;
    }

    // A string representing the number of particles in the pool.
    poolStatusString() {
        let liveCount = this.liveParticles.length;
        let reusableCount = this.reusableParticles.length;
        let totalCount = liveCount + reusableCount;
        let poolStatusString = `total: ${totalCount}, live: ${liveCount}, reusable: ${reusableCount}`;
        return poolStatusString;
    }

    // Prints the number of particles in the pool.
    printPoolStatus() {
        let poolStatusString = this.poolStatusString();
        print(poolStatusString);
    }

    // Assignable functions

    #allocateNewParticle;
    #particleIsReadyForReuse;
}
