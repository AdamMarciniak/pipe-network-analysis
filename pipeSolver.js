const { transpose, multiply, subtract, add, inv } = require('mathjs')

// prettier-ignore
const data = [
  {
    pipe: 0,
    node1: 0,
    node2: 1,
    elev1: 10,
    elev2: null,
    length: 2,
    dia: 0.1,
    flow: null,
  },
  {
    pipe: 1,
    node1: 1,
    node2: 2,
    elev1: null,
    elev2: null,
    length: 2,
    dia: 0.1,
    flow: null,
  },
  {
    pipe: 2,
    node1: 1,
    node2: 3,
    elev1: null,
    elev2: null,
    length: 2,
    dia: 0.1,
    flow: null,
  },
  {
    pipe: 3,
    node1: 2,
    node2: 3,
    elev1: null,
    elev2: null,
    length: 2,
    dia: 0.1,
    flow: null,
  },
  {
    pipe: 4,
    node1: 2,
    node2: 4,
    elev1: null,
    elev2: null,
    length: 2,
    dia: 0.1,
    flow: null,
  },
  {
    pipe: 5,
    node1: 3,
    node2: 4,
    elev1: null,
    elev2: null,
    length: 2,
    dia: 0.1,
    flow: null,
  },
  {
    pipe: 6,
    node1: 4,
    node2: 5,
    elev1: null,
    elev2: 0,
    length: 2,
    dia: 0.1,
    flow: null,
  },
]

const getKinematicViscWater = () => {
  return 1 * 1e-6 //m^2/s
}

const getReynolds = (vel, dia) => {
  // vel : m/s
  // kinVisc : mm^2 /s
  // dia m
  return (vel * dia) / getKinematicViscWater()
}

const getFixedNodes = data => {
  const fixedNodes = []
  data.forEach(node => {
    if (node.elev1 !== null && !fixedNodes.includes(node.node1)) {
      fixedNodes.push(node.node1)
    }
    if (node.elev2 !== null && !fixedNodes.includes(node.node2)) {
      fixedNodes.push(node.node2)
    }
  })
  return fixedNodes
}

const getNonFixedNodes = data => {
  const nonFixedNodes = []
  data.forEach(node => {
    if (node.elev1 === null && !nonFixedNodes.includes(node.node1)) {
      nonFixedNodes.push(node.node1)
    }
    if (node.elev2 === null && !nonFixedNodes.includes(node.node2)) {
      nonFixedNodes.push(node.node2)
    }
  })
  return nonFixedNodes
}

const getA = (data, nodes) => {
  const A = []
  for (let i = 0; i < data.length; i += 1) {
    const row = []
    nodes.forEach(node => {
      if (node === data[i].node1) {
        row.push(1)
      } else if (node === data[i].node2) {
        row.push(-1)
      } else {
        row.push(0)
      }
    })
    A.push(row)
  }
  return A
}

const getElevation = data => {
  const elev = []
  const elevNodes = []
  data.forEach(pipe => {
    if (pipe.elev1 !== null && !elevNodes.includes(pipe.node1)) {
      elevNodes.push(pipe.node1)
      elev.push(pipe.elev1)
    }
    if (pipe.elev2 !== null && !elevNodes.includes(pipe.node2)) {
      elevNodes.push(pipe.node2)
      elev.push(pipe.elev2)
    }
  })
  return elev
}

const getFlow = (velocity, diameter) => {
  const area = Math.PI * Math.pow(diameter / 2, 2)
  const flow = velocity * area
  return flow
}

const getInitialFlows = data => {
  const initialVel = 0.3048 //m/s
  const flows = []
  data.forEach(pipe => {
    flows.push(getFlow(initialVel, pipe.dia))
  })
  return flows
}

const getVelocity = (flow, dia) => {
  const area = Math.PI * Math.pow(dia / 2, 2)
  return flow / area
}

const getFrictionFactor = (vel, dia) => {
  const reynolds = getReynolds(vel, dia)
  if (reynolds < 2000) {
    return 64 / reynolds
  }
  return 64 / reynolds
}

const getResistanceFactor = (flow, dia, length) => {
  const vel = getVelocity(flow, dia)
  const f = getFrictionFactor(vel, dia)
  return (8 * f * length) / (Math.pow(Math.PI, 2) * 9.81 * Math.pow(dia, 5))
}

const getGMatrix = (Q, res) => {
  const G = []
  for (let i = 0; i < Q.length; i += 1) {
    const row = []
    for (let j = 0; j < Q.length; j += 1) {
      if (i === j) {
        const denom = Q[i] * res[i]
        row.push(1 / denom)
      } else {
        row.push(0)
      }
    }
    G.push(row)
  }
  return G
}

const setFlows = (data, Q) => {
  for (let i = 0; i < data.length; i += 1) {
    data[i].flow = Q[i]
  }
}

const setResistance = data => {
  for (let i = 0; i < data.length; i += 1) {
    data[i].res = getResistanceFactor(data[i].flow, data[i].dia, data[i].length)
  }
}

const getRes = data => {
  const res = []
  for (let i = 0; i < data.length; i += 1) {
    res.push(data[i].res)
  }
  return res
}

const getLargestChange = (oldMatrix, newMatrix) => {
  const changes = subtract(oldMatrix, newMatrix).map(flow => Math.abs(flow))
  return Math.max(...changes)
}

// TODO
// Get proper resistance equations in place based on reynolds numbers
// Get demand working as part of the pipe object
// bundle into a nice callable function.

const runSolver = (data, maxTolerance) => {
  const A1 = getA(data, getNonFixedNodes(data))
  const A2 = getA(data, getFixedNodes(data))
  const elev = getElevation(data)
  const Q = getInitialFlows(data)
  const dem = [0, 0, 0, 0]

  const solveQandH = Q => {
    setFlows(data, Q)
    setResistance(data)
    const res = getRes(data)
    const G = getGMatrix(Q, res)
    const A1T = transpose(A1)

    // Matrix operations split into pieces for convenience.
    // Solve for H
    const n = 2
    const term1 = multiply(multiply(A1T, G), A1)
    const lastTerm = subtract(
      multiply(1 - n, Q),
      multiply(multiply(G, A2), elev),
    )
    const thirdTerm = multiply(A1T, lastTerm)
    const rightTerm = add(multiply(-n, dem), thirdTerm)
    const H = multiply(inv(term1), rightTerm)

    // Solve for Qnew
    const QrightTerm = multiply(G, add(multiply(A2, elev), multiply(A1, H)))
    const QleftTerm = multiply(n - 1, Q)
    const Qnew = multiply(1 / n, add(QleftTerm, QrightTerm))
    return [H, Qnew]
  }

  let Q2 = Q
  let H2 = [0, 0, 0, 0]

  let change = Infinity
  let iters = 0
  while (change > maxTolerance) {
    iters += 1
    const [H, Q3] = solveQandH(Q2)
    change = getLargestChange(H, H2)
    H2 = H
    Q2 = Q3
  }
  console.log(`Finished after: ${iters} iterations`)
  console.log(`Infinite norm of heads: ${change}`)

  return [Q2, H2]
}

const [Q1, H1] = runSolver(data, 0.00001)

console.table(Q1)
console.table(H1)
