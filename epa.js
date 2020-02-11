
const kinVisc = 1 // cSt
const density = 1; //62.428 lb/cuft
const gravity = 32.174; //ft/s^2
const gauss = require('./gauss');

const getReynolds = (velocity, diameter) => {
    // Vel ft/s, dia in
    return 7745.8 * velocity * diameter / kinVisc;
};

const getVelocity = (flow, diameter) => {
    // flow in cuft/sec
    // vel in ft/sec
    // diameter in inches
    return Math.abs(flow) / (Math.PI * Math.pow(diameter / 12 / 2, 2))
}

const getVelocityHead = (velocity) => {
    return density * Math.pow(velocity, 2) / (2 * density * gravity);
};

const getMinorLoss = (velocity, diameter) => {
    return 0;
    //return 0.02517 * getVelocityHead(velocity) / Math.pow(diameter / 12, 4);
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
    return 250;
    return 0.0252 * frictionFactor * Math.pow(diameter / 12, -5) * length;
}



const lengths = [
    [0, 5, 0, 0, 0],
    [5, 0, 2, 6, 0],
    [0, 2, 0, 7, 0],
    [0, 6, 7, 0, 2],
    [0, 0, 0, 2, 0],
];

const dias = [
    [0, 12, 0, 0, 0],
    [12, 0, 12, 12, 0],
    [0, 12, 0, 12, 0],
    [0, 12, 12, 0, 12],
    [0, 0, 0, 12, 0],
];

const flows = [
    [0, 1, 0, 0, 0],
    [1, 0, 0.05, 0.05, 0],
    [0, 2, 0, 0.05, 0],
    [0, -0.05, 2, 0, 0.05],
    [0, 0, 0, -0.05, 0],
]

const heads = [
    5,
    0,
    0,
    0,
    2
]

const iterate = () => {

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
            const D = dias[i][j];
            const L = lengths[i][j];
            if (Q === 0 || D === 0 || L === 0) {
                p[i][j] = 0;
            } else {
                let r = getResistanceCoeff(getFrictionFactor(getReynolds(getVelocity(Q, D), D)), D, L);
                let n = getFlowExponent();
                let m = getMinorLoss(getVelocity(Q, D), D);
                p[i][j] = 1 / (n * r * Math.pow(Math.abs(Q), n - 1) + 2 * m * Math.abs(Q));
            }

        }
    }
    // console.log('P');
    // console.table(p);

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

                A[i][j] = p[i][j] != 0 ? -p[i][j] : 0;
            }
        }
    }

    // finding y's
    for (let i = 0; i < flows.length; i += 1) {
        for (let j = 0; j < flows.length; j += 1) {
            const Q = flows[i][j];
            const sgn = Q > 0 ? 1 : -1;
            const D = dias[i][j];
            const L = lengths[i][j];
            if (D === 0 || Q === 0 || L === 0) {
                y[i][j] === 0;
            } else {
                let r = getResistanceCoeff(getFrictionFactor(getReynolds(getVelocity(Q, D), D)), D, L);
                const n = getFlowExponent();
                const m = getMinorLoss(getVelocity(Q, D), D);
                y[i][j] = sgn * p[i][j] * (r * Math.pow(Math.abs(Q), n) + m * Math.pow(Math.abs(Q), 2));

            }


        }
    }


    const F = [];
    // console.log('FLOWS');
    // console.table(flows);
    // console.log('p');
    // console.table(p);
    // console.log('y');
    // console.table(y);
    // Find F
    for (let i = 0; i < flows.length; i += 1) {
        let Qsum = 0;
        let ySum = 0;
        let pHSum = 0;
        let Dsum = 0;
        let H = 0;
        for (let j = 0; j < flows.length; j += 1) {
            Qsum += flows[i][j];
            ySum += y[i][j];

            if ((i === 1 && j === 0) || (i === 3 && j === 4)) {
                console.log('ij', i, j)
                H = heads[j];
                pHSum += p[i][j];

            }

        }

        F.push(Qsum + ySum + pHSum * H);
    }

    console.table(A);
    console.table(F);

    const newA = A.slice(1, 4);
    const newF = F.slice(1, 4);

    console.table(F);
    console.log('F');
    console.table(newF);
    console.log('A');
    console.table(newA);
    for (let i = 0; i < newA.length; i += 1) {
        const row = [];
        for (let j = 1; j < 4; j += 1) {
            row.push(newA[i][j]);
        }
        newA[i] = row;
    }
    console.log('A');
    console.table(newA);

    const newHeads = gauss(newA, newF);


    newHeads.unshift(heads[0])
    newHeads.push(heads[4]);


    for (let i = 0; i < flows.length; i += 1) {
        for (let j = 0; j < flows.length; j += 1) {
            if (flows[i][j] !== 0) {
                flows[i][j] = flows[i][j] - (y[i][j] - p[i][j] * (newHeads[i] - newHeads[j]))
            }
        }
    }

    console.log('New Flows')
    console.table(flows);

}

let i = 0;

while (i < 10) {
    iterate();
    i += 1;
}




