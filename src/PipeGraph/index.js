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
  const pipeKey = lineToKey(fromNode, toNode)
  const pipeList = Object.keys(initialGraph.pipes)
  if (pipeList.includes(pipeKey)) {
    throw Error('Pipe is already in graph')
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

  return {
    ...initialGraph,
    nodes: {
      ...initialGraph.nodes,
      [nodeKey]: nodeAttributes,
    },
  }
}
