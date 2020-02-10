
const kinVisc = 1;
const density = 1;
const gravity = 32.174;
const gauss = require('./gauss');

const getReynolds = (velocity, diameter) => {
    // Vel ft/s, dia in
    return 7745.8 * velocity * diameter / kinVisc;
};

const getVelocity = (flow, diameter) => {
    return Math.abs(flow) / (Math.PI * Math.pow(diameter / 2, 2))
}

const getVelocityHead = (velocity) => {
    return density * Math.pow(velocity, 2) / (2 * density * gravity);
};

const getMinorLoss = (velocity, diameter) => {
    return 0.02517 * getVelocityHead(velocity) / diameter;
}

const getFrictionFactor = (re) => {
    if (re < 2000) {
        // Hagen Poisueille
        return 64 / re
    }

    if (re > 4000) {
        // Swamee - Jain
    }

    if (re > 2000 && re < 4000) {
        // Interpolation of moody diagram
    }
    return 64 / re
}

const getFlowExponent = () => {
    return 2;
}

const getResistanceCoeff = (frictionFactor, diameter, length) => {
    // DARCY equation
    return 0.0252 * frictionFactor * Math.pow(diameter, -5) * length;
}

const pipeInfo = {
    0: { L: 10, D: 24 },
    1: { L: 5, D: 24 },
    2: { L: 2, D: 24 },
    3: { L: 4, D: 24 },
    4: { L: 2, D: 24 },
    5: { L: 2, D: 24 }
}

const flows = [
    [0, -0.1, 0, 0, 0],
    [0.1, 0, 0.5, 0.1, 0],
    [0, -0.5, 0, 0.1, 0],
    [0, -0.1, -0.1, 0, 0.3],
    [0, 0, 0, -0.3, 0],
]

const p = [];
const A = [];
const y = [];

//make empty arrays
flows.forEach((row) => {
    const zeros = [];
    flows.forEach((item) => {
        zeros.push(0);
    })
    p.push(zeros);
})

flows.forEach((row) => {
    const zeros = [];
    flows.forEach((item) => {
        zeros.push(0);
    })
    A.push(zeros);
})

flows.forEach((row) => {
    const zeros = [];
    flows.forEach((item) => {
        zeros.push(0);
    })
    y.push(zeros);
})


// Finding p matrix
for (let i = 0; i < flows.length; i += 1) {
    for (let j = 0; j < flows.length; j += 1) {
        const Q = flows[i][j];
        const r = getResistanceCoeff(getFrictionFactor(getReynolds(getVelocity(Q, pipeInfo[i].D), pipeInfo[i].D)), pipeInfo[i].D, pipeInfo[i].L);
        const n = getFlowExponent();
        const m = getMinorLoss(getVelocity(Q, pipeInfo[i].D), pipeInfo[i].D);
        p[i][j] = 1 / (n * r * Math.pow(Math.abs(Q), n - 1) + 2 * m * Math.abs(Q));
        if (isNaN(p[i][j])) {
            p[i][j] = 0;
        }
    }
}

// finding diagonal A terms.
const Adiag = [];
for (let i = 0; i < p.length; i += 1) {
    let sum = 0;
    for (let j = 0; j < p.length; j += 1) {
        sum += p[i][j];
    }
    Adiag.push(sum);
}

//Populating A Matrix.
for (let i = 0; i < flows.length; i += 1) {
    for (let j = 0; j < flows.length; j += 1) {
        if (i === j) {
            A[i][j] = Adiag[i]
        } else {
            A[i][j] = -p[i][j];
        }
    }
}

// finding y's
for (let i = 0; i < flows.length; i += 1) {
    for (let j = 0; j < flows.length; j += 1) {
        const Q = flows[i][j];
        const sgn = Q > 0 ? 1 : 0;
        const r = getResistanceCoeff(getFrictionFactor(getReynolds(getVelocity(Q, pipeInfo[i].D), pipeInfo[i].D)), pipeInfo[i].D, pipeInfo[i].L);
        const n = getFlowExponent();
        const m = getMinorLoss(getVelocity(Q, pipeInfo[i].D), pipeInfo[i].D);
        y[i][j] = sgn * p[i][j] * (r * Math.pow(Math.abs(Q), n) + m * Math.pow(Math.abs(Q), 2));
        if (isNaN(y[i][j])) {
            y[i][j] = 0;
        }
    }
}

const F = [];

// Find F
for (let i = 0; i < flows.length; i += 1) {
    let Qsum = 0;
    let ySum = 0;
    let pHSum = 0;
    let Dsum = 0;

    for (let j = 0; j < flows.length; j += 1) {
        Qsum += flows[i][j];
        ySum += y[i][j];
        if (flows[i][j] < 0) {
            Dsum += flows[i][j];
        }
    }

    F.push(Qsum - (-Dsum) + ySum + pHSum);
}

console.log(A);
console.log(F);
console.log(gauss(A, F))




