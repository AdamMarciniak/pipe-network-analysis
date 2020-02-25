export const coordsToKey = coords => {
  const badValue = coords.find(e => !(typeof e === 'number'))
  if (badValue) {
    throw new TypeError(
      `Coords must be an array of numbers (given ${typeof badValue})`,
    )
  }
  return coords.join(',')
}

export const lineToKey = (coords1, coords2) =>
  [coords1, coords2]
    .map(x => coordsToKey(x))
    .sort()
    .join(',')

export const addPipe = (initialGraph, pipeAttributes, fromNode, toNode) => {
  if (fromNode.toString() === toNode.toString()) {
    console.log('SAME', fromNode, toNode)
    return initialGraph
  }
  const pipeKey = lineToKey(fromNode, toNode)
  const pipeList = Object.keys(initialGraph.pipes)
  if (pipeList.includes(pipeKey)) {
    return initialGraph
  }
  return {
    ...initialGraph,
    pipes: {
      ...initialGraph.pipes,
      [pipeKey]: pipeAttributes,
    },
  }
}

export const addNode = (initialGraph, coords, nodeAttributes) => {
  const nodeKey = coordsToKey(coords)
  const initialNodes = Object.keys(initialGraph.nodes)
  if (initialNodes.includes(nodeKey)) {
    return initialGraph
  }

  return {
    ...initialGraph,
    nodes: {
      ...initialGraph.nodes,
      [nodeKey]: nodeAttributes,
    },
  }
}

export const getNodeMatrix = (graph, fixed) => {
  const matrix = []
  const allNodes = graph.nodes
  const filteredNodes = Object.keys(allNodes).filter(
    node => allNodes[node].fixed === fixed,
  )
  Object.keys(graph.pipes).forEach(pipe => {
    const pipeIdList = pipe.split(',')
    const pipeStartNode = `${pipeIdList[0]},${pipeIdList[1]}`
    const pipeEndNode = `${pipeIdList[2]},${pipeIdList[3]}`
    const matrixRow = []

    filteredNodes.forEach(node => {
      if (node === pipeStartNode) {
        matrixRow.push(-1)
      } else if (node === pipeEndNode) {
        matrixRow.push(1)
      } else {
        matrixRow.push(0)
      }
    })
    if (matrixRow.length > 0) {
      matrix.push(matrixRow)
    }
  })
  return matrix
}

export const removeNode = (graph, removedNode) => {
  const { [removedNode]: _, ...newNodes } = graph.nodes
  const newPipes = {}

  Object.keys(graph.pipes).forEach(pipe => {
    if (
      pipe.substring(0, 3) !== removedNode &&
      pipe.substring(4) !== removedNode
    ) {
      newPipes[pipe] = graph.pipes[pipe] === undefined ? {} : graph.pipes[pipe]
    }
  })
  return { ...graph, nodes: newNodes, pipes: newPipes }
}

export const removePipe = (graph, removedPipe) => {
  const { [removedPipe]: _, ...restOfPipes } = graph.pipes
  return { ...graph, pipes: restOfPipes }
}

export const changePipe = (graph, pipe, attributes) => {
  if (Object.keys(graph.pipes).includes(pipe)) {
    return { ...graph, pipes: { ...graph.pipes, [pipe]: attributes } }
  } else {
    throw Error(`Cannot change pipe. Pipe "${pipe}" does not exist in graph.`)
  }
}

export const changeNode = (graph, node, attributes) => {
  if (Object.keys(graph.nodes).includes(node)) {
    return { ...graph, nodes: { ...graph.nodes, [node]: attributes } }
  } else {
  }
  throw new Error(`Cannot change node. Node ${node} does not exist in graph.`)
}

export const dragNode = (graph, oldNode, newNode) => {
  const oldAttributes = graph.nodes[oldNode]
  const { [oldNode]: _, ...restOfNodes } = graph.nodes
  restOfNodes[newNode] = oldAttributes
  const oldPipes = graph.pipes
  const newPipes = {}
  Object.keys(oldPipes).forEach(oldPipeId => {
    let newPipeId = oldPipeId
    let oldPipeAttributes = graph.pipes[oldPipeId]
    const oldPipeStart = `${oldPipeId.split(',')[0]},${oldPipeId.split(',')[1]}`
    const oldPipeEnd = `${oldPipeId.split(',')[2]},${oldPipeId.split(',')[3]}`
    if (oldPipeStart === oldNode) {
      newPipeId = `${newNode},${oldPipeEnd}`
    } else if (oldPipeEnd === oldNode) {
      newPipeId = `${oldPipeStart},${newNode}`
    }
    newPipes[newPipeId] = oldPipeAttributes
  })
  return { nodes: restOfNodes, pipes: newPipes }
}
