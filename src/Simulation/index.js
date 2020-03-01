const {
  transpose,
  multiply,
  subtract,
  add,
  inv,
  zeros,
  size,
  subset,
  index,
} = require('mathjs')

const getGravity = () => {
  return 32.174 //ft/s^2
}

const getFlowExponent = () => {
  return 2
}

const getKinVisc = () => {
  return 1 // cSt
}

const getDensity = () => {
  return 62.428 // lb/cuft
}

const getVelocityHead = velocity => {
  // velocity in ft/s
  // density in lb/cuft
  return Math.pow(velocity, 2) / (getDensity() * getGravity())
}

const getVelocity = (flow, diameter) => {
  // flow in cuft/sec
  // vel in ft/sec
  // diameter in ft
  return Math.abs(flow) / (Math.PI * Math.pow(diameter / 2, 2))
}

const getMinorLoss = (velocity, diameter) => {
  return (0.02517 * getVelocityHead(velocity)) / Math.pow(diameter / 12, 4)
}

const getReynolds = (velocity, diameter) => {
  // Vel ft/s, dia in
  return (7745.8 * velocity * diameter) / getKinVisc()
}

const getFrictionFactor = (velocity, diameter) => {
  const reynolds = getReynolds(velocity, diameter)
  if (reynolds < 2000) {
    // Hagen Poisueille
    return 64 / reynolds
  }

  if (reynolds > 4000) {
    // Swamee - Jain
  }

  if (reynolds > 2000 && reynolds < 4000) {
    // Interpolation of moody diagram
  }
  return 64 / reynolds //for now just use Hagen P
}
const getResistanceCoeff = (velocity, diameter, length) => {
  // DARCY equation
  //diameter feet, length feet, velocity ft/2
  return (
    0.0252 *
    getFrictionFactor(velocity, diameter) *
    Math.pow(diameter, -5) *
    length
  )
}

const getFlow = (velocity, diameter) => {
  const area = Math.PI * Math.pow(diameter / 2, 2)
  const flow = velocity * area
  return flow
}

const getInitialFlowVector = pipes => {
  const flowVector = []
  const initialVelocity = 1 //ft/s
  pipes.forEach(pipe => {
    flowVector.push(getFlow(initialVelocity, pipe.diameter))
  })
  return flowVector
}

const getElevations = nodes => {
  const elevations = []
  nodes
    .filter(node => node.fixed === true)
    .forEach(node => {
      elevations.push(node.elevation)
    })
  return elevations
}

const getDemands = nodes => {
  const demands = []
  nodes
    .filter(node => !node.fixed)
    .forEach(node => {
      demands.push(node.demand)
    })
  return demands
}

const getVelocities = (flows, pipes) => {
  const velocities = []
  for (let i = 0; i < pipes.length; i += 1) {
    const velocity = getVelocity(flows[i], pipes[i].diameter)
    velocities.push(velocity)
  }
  return velocities
}

const getFrictionFactors = (velocities, pipes) => {
  const frictionFactors = []
  for (let i = 0; i < pipes.length; i += 1) {
    const frictionFactor = getFrictionFactor(velocities[i], pipes[i].diameter)
    frictionFactors.push(frictionFactor)
  }
  return frictionFactors
}

const getPipeResistances = (velocities, pipes) => {
  const pipeResistances = []
  for (let i = 0; i < pipes.length; i += 1) {
    pipeResistances.push(
      getResistanceCoeff(velocities[i], pipes[i].diameter, pipes[i].length),
    )
  }
  return pipeResistances
}

const getGMatrix = (resistances, flows) => {
  const GMatrix = []
  for (let i = 0; i < flows.length; i += 1) {
    const GRow = []
    for (let j = 0; j < flows.length; j += 1) {
      if (i === j) {
        GRow.push(1 / (resistances[i] * Math.abs(flows[i])))
      } else {
        GRow.push(0)
      }
    }
    GMatrix.push(GRow)
  }
  return GMatrix
}

const getLargestChange = (oldMatrix, newMatrix) => {
  const changes = subtract(oldMatrix, newMatrix).map(flow => Math.abs(flow))
  return size(changes) > 1 ? Math.max(...changes) : subset(changes, index(0))
}

export const runSimulation = (A1, A2, pipes, nodes, tolerance) => {
  let error = Infinity

  let flows = getInitialFlowVector(pipes)
  const A1T = transpose(A1)
  const elevations = getElevations(nodes)
  const demands = getDemands(nodes)
  let H = zeros(nodes.filter(node => !node.fixed).length)._data

  let i = 0
  while (error > tolerance) {
    const velocities = getVelocities(flows, pipes)
    const frictionFactors = getFrictionFactors(velocities, pipes)
    const pipeResistances = getPipeResistances(velocities, pipes)
    const n = getFlowExponent()
    const G = getGMatrix(pipeResistances, flows)
    console.log('Flows:', flows)
    // console.log('Velocities:', velocities)
    // console.log('Iteration:', i)
    // console.log('elevations', elevations)
    // console.log('demands', demands)
    // console.log('pipeResist', pipeResistances)
    // console.log('G', G)

    const term1 = multiply(multiply(A1T, G), A1)

    const lastTerm = subtract(
      multiply(1 - n, flows),
      multiply(multiply(G, A2), elevations),
    )
    const thirdTerm = multiply(A1T, lastTerm)
    const rightTerm = add(multiply(-n, demands), thirdTerm)
    const Hnew = multiply(inv(term1), rightTerm)

    // Solve for Qnew
    const QrightTerm = multiply(
      G,
      add(multiply(A2, elevations), multiply(A1, H)),
    )
    const QleftTerm = multiply(n - 1, flows)
    const Qnew = multiply(1 / n, add(QleftTerm, QrightTerm))

    error = getLargestChange(H, Hnew)

    H = Hnew
    flows = Qnew

    i += 1
  }

  return [H, flows]
}
