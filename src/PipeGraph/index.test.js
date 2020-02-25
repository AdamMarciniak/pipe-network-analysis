import {
  addPipe,
  addNode,
  coordsToKey,
  lineToKey,
  getNodeMatrix,
  removeNode,
  removePipe,
  changePipe,
  changeNode,
  dragNode,
} from './index'

describe('coordsToKey', () => {
  test('produces "0,1" given [0,1]', () => {
    expect(coordsToKey([0, 1])).toEqual('0,1')
  })

  test('produces "0,-1" given [0,-1]', () => {
    expect(coordsToKey([0, -1])).toEqual('0,-1')
  })

  test('throws an error given array of strings', () => {
    expect(() => coordsToKey(['h', 'a'])).toThrow()
  })
})

describe('lineToKey', () => {
  test('produces "1,2,3,4" given ([1,2],[3,4])', () => {
    expect(lineToKey([1, 2], [3, 4])).toEqual('1,2,3,4')
  })

  test('produces "2,2,3,4" given ([2,2],[3,4])', () => {
    expect(lineToKey([2, 2], [3, 4])).toEqual('2,2,3,4')
  })

  test('produces "2,2,3,4" given ([3,4],[2,2])', () => {
    expect(lineToKey([3, 4], [2, 2])).toEqual('2,2,3,4')
  })

  test('produces "-2,2,3,4" given ([3,4],[-2,2])', () => {
    expect(lineToKey([3, 4], [-2, 2])).toEqual('-2,2,3,4')
  })

  test('produces different results for [1,1], [0,0] and [1,0], [0,1]', () => {
    expect(lineToKey([1, 1], [0, 0])).not.toEqual(lineToKey([1, 0], [0, 1]))
  })

  test('produces different results for [-1,1], [0,0] and [1,1], [0,0]', () => {
    expect(lineToKey([-1, 1], [0, 0])).not.toEqual(lineToKey([1, 0], [0, 0]))
  })

  test('produces the same result for [1,2], [1,0] and [1,0], [1,2]', () => {
    expect(lineToKey([1, 2], [3, 0])).toEqual(lineToKey([3, 0], [1, 2]))
  })
})

describe('addPipe', () => {
  test('returns new graph with pipe between given nodes', () => {
    const initialGraph = {
      nodes: {
        '0,1': {},
        '1,2': {},
      },
      pipes: {},
    }

    const pipeAttributes = {}
    const fromNode = [0, 1]
    const toNode = [1, 2]

    expect(addPipe(initialGraph, pipeAttributes, fromNode, toNode)).toEqual({
      nodes: {
        '0,1': {},
        '1,2': {},
      },
      pipes: {
        '0,1,1,2': {},
      },
    })
  })

  test('returns new graph with pipe and attributes set ', () => {
    const initialGraph = {
      nodes: {
        '0,1': {},
        '1,2': {},
      },
      pipes: {},
    }

    const pipeAttributes = 'test'
    const fromNode = [0, 1]
    const toNode = [1, 2]

    expect(addPipe(initialGraph, pipeAttributes, fromNode, toNode)).toEqual({
      nodes: {
        '0,1': {},
        '1,2': {},
      },
      pipes: {
        '0,1,1,2': 'test',
      },
    })
  })

  test('returns initialGraph if pipe already in initialGraph', () => {
    const initialGraph = {
      nodes: {
        '0,1': {},
        '1,2': {},
      },
      pipes: { '1,2,3,4': {} },
    }

    const pipeAttributes = 'test'
    const fromNode = [3, 4]
    const toNode = [1, 2]

    expect(addPipe(initialGraph, pipeAttributes, fromNode, toNode)).toEqual(
      initialGraph,
    )
  })

  test('returns initialGraph if pipe both nodes are the same', () => {
    const initialGraph = {
      nodes: {
        '0,1': {},
        '1,2': {},
      },
      pipes: { '1,2,3,4': {} },
    }

    const pipeAttributes = 'test'
    const node = [3, 4]

    expect(addPipe(initialGraph, pipeAttributes, node, node)).toEqual(
      initialGraph,
    )
  })
})

describe('addNode', () => {
  test('produces new graph with added node', () => {
    const initialGraph = {
      nodes: {
        '0,1': {},
        '1,2': {},
      },
      pipes: {},
    }

    const node = [0, 4]
    const nodeAttributes = {}

    expect(addNode(initialGraph, node, nodeAttributes)).toEqual({
      nodes: {
        '0,1': {},
        '1,2': {},
        '0,4': {},
      },
      pipes: {},
    })
  })

  test('throws error if node already in initialGraph', () => {
    const initialGraph = {
      nodes: {
        '0,1': {},
        '1,2': {},
      },
      pipes: {},
    }

    const node = [1, 2]
    const nodeAttributes = {}

    expect(() => addNode(initialGraph, node, nodeAttributes)).toThrow()
  })
})

describe('getNodeMatrix', () => {
  test('returns non-fixed node output matrix from graph', () => {
    const graph = {
      nodes: {
        '0,1': { fixed: true },
        '1,2': { fixed: false },
        '1,3': { fixed: false },
        '2,3': { fixed: true },
      },
      pipes: {
        '0,1,1,3': {},
        '0,1,1,2': {},
        '1,2,1,3': {},
        '2,3,1,2': {},
      },
    }

    const outputMatrix = [
      [0, 1],
      [1, 0],
      [-1, 1],
      [1, 0],
    ]

    expect(getNodeMatrix(graph, false)).toEqual(outputMatrix)
  })

  test('returns fixed node output matrix from graph', () => {
    const graph = {
      nodes: {
        '0,1': { fixed: true },
        '1,2': { fixed: false },
        '1,3': { fixed: false },
        '2,3': { fixed: true },
      },
      pipes: {
        '0,1,1,3': {},
        '0,1,1,2': {},
        '1,2,1,3': {},
        '2,3,1,2': {},
      },
    }

    const outputMatrix = [
      [-1, 0],
      [-1, 0],
      [0, 0],
      [0, -1],
    ]

    expect(getNodeMatrix(graph, true)).toEqual(outputMatrix)
  })

  test('returns empty array given graph with no pipes', () => {
    const graph = {
      nodes: {
        '0,1': { fixed: true },
        '1,2': { fixed: false },
        '1,3': { fixed: false },
      },
      pipes: {},
    }

    expect(getNodeMatrix(graph, false)).toEqual([])
  })

  test('produces empty array given graph with no nodes', () => {
    const graph = {
      nodes: {},
      pipes: { '0,1,1,3': {}, '0,1,1,2': {}, '1,2,1,3': {} },
    }

    expect(getNodeMatrix(graph, false)).toEqual([])
  })
})

describe('removeNode', () => {
  test('returns new graph with indicated node and connected pipes removed', () => {
    const graph = {
      nodes: {
        '0,1': { fixed: true },
        '1,2': { fixed: false },
        '1,3': { fixed: false },
        '2,3': { fixed: true },
      },
      pipes: {
        '0,1,1,3': {},
        '0,1,1,2': {},
        '1,2,1,3': {},
        '2,3,1,2': {},
      },
    }

    const node = '1,3'
    const newGraph = {
      nodes: {
        '0,1': { fixed: true },
        '1,2': { fixed: false },
        '2,3': { fixed: true },
      },
      pipes: {
        '0,1,1,2': {},
        '2,3,1,2': {},
      },
    }

    expect(removeNode(graph, node)).toEqual(newGraph)
  })

  test('returns same graph when given a node not in graph', () => {
    const graph = {
      nodes: {
        '0,1': { fixed: true },
        '1,2': { fixed: false },
        '1,3': { fixed: false },
        '2,3': { fixed: true },
      },
      pipes: {
        '0,1,1,3': {},
        '0,1,1,2': {},
        '1,2,1,3': {},
        '2,3,1,2': {},
      },
    }

    const node = '1,5'
    expect(removeNode(graph, node)).toEqual(graph)
  })
})

describe('removePipe', () => {
  test('returns new graph with indicated pipe removed', () => {
    const graph = {
      nodes: {
        '0,1': { fixed: true },
        '1,2': { fixed: false },
        '1,3': { fixed: false },
        '2,3': { fixed: true },
      },
      pipes: {
        '0,1,1,3': {},
        '0,1,1,2': {},
        '1,2,1,3': {},
        '2,3,1,2': {},
      },
    }

    const pipeToRemove = '0,1,1,2'

    const newGraph = {
      nodes: {
        '0,1': { fixed: true },
        '1,2': { fixed: false },
        '1,3': { fixed: false },
        '2,3': { fixed: true },
      },
      pipes: {
        '0,1,1,3': {},
        '1,2,1,3': {},
        '2,3,1,2': {},
      },
    }

    expect(removePipe(graph, pipeToRemove)).toEqual(newGraph)
  })

  test('returns same graph if removed pipe is not in graph', () => {
    const graph = {
      nodes: {
        '0,1': { fixed: true },
        '1,2': { fixed: false },
        '1,3': { fixed: false },
        '2,3': { fixed: true },
      },
      pipes: {
        '0,1,1,3': {},
        '0,1,1,2': {},
        '1,2,1,3': {},
        '2,3,1,2': {},
      },
    }
    const pipeToRemove = '8,8,8,8'
    expect(removePipe(graph, pipeToRemove)).toEqual(graph)
  })
})

describe('changePipe', () => {
  const graph = {
    nodes: {
      '0,1': { fixed: true },
      '1,2': { fixed: false },
      '1,3': { fixed: false },
      '2,3': { fixed: true },
    },
    pipes: {
      '0,1,1,3': {},
      '0,1,1,2': {},
      '1,2,1,3': {},
      '2,3,1,2': {},
    },
  }

  const pipe = '0,1,1,3'
  const attributes = { roughness: 0.24, length: 10, diameter: 2 }
  const outputGraph = {
    nodes: {
      '0,1': { fixed: true },
      '1,2': { fixed: false },
      '1,3': { fixed: false },
      '2,3': { fixed: true },
    },
    pipes: {
      '0,1,1,3': { roughness: 0.24, length: 10, diameter: 2 },
      '0,1,1,2': {},
      '1,2,1,3': {},
      '2,3,1,2': {},
    },
  }
  test('returns new graph with selected pipe attribute changed', () => {
    expect(changePipe(graph, pipe, attributes)).toEqual(outputGraph)
  })
  test('throws error if pipe to be changed not in graph', () => {
    expect(() => changePipe(graph, '1,2,3,4', attributes)).toThrow()
  })
})

describe('changeNode', () => {
  const graph = {
    nodes: {
      '0,1': { fixed: true },
      '1,2': { fixed: false },
      '1,3': { fixed: false },
      '2,3': { fixed: true },
    },
    pipes: {
      '0,1,1,3': {},
      '0,1,1,2': {},
      '1,2,1,3': {},
      '2,3,1,2': {},
    },
  }

  const node = '0,1'
  const attributes = { fixed: true, extra: false, words: 'hello' }
  const outputGraph = {
    nodes: {
      '0,1': { fixed: true, extra: false, words: 'hello' },
      '1,2': { fixed: false },
      '1,3': { fixed: false },
      '2,3': { fixed: true },
    },
    pipes: {
      '0,1,1,3': {},
      '0,1,1,2': {},
      '1,2,1,3': {},
      '2,3,1,2': {},
    },
  }
  test('returns new graph with selected node attribute changed', () => {
    expect(changeNode(graph, node, attributes)).toEqual(outputGraph)
  })

  test('throws error if node to be changed not in graph', () => {
    expect(() => changeNode(graph, '9,9', attributes)).toThrow()
  })
})

describe('dragNode', () => {
  test('return new graph with node coordinate changed same attributes as well as pipe id changed', () => {
    const graph = {
      nodes: {
        '0,1': { fixed: true },
        '1,2': { fixed: false },
        '1,3': { fixed: false },
        '2,3': { fixed: true },
      },
      pipes: {
        '0,1,1,3': {},
        '0,1,1,2': {},
        '1,2,1,3': {},
        '2,3,1,2': {},
      },
    }

    const newGraph = {
      nodes: {
        '0,1': { fixed: true },
        '4,5': { fixed: false },
        '1,3': { fixed: false },
        '2,3': { fixed: true },
      },
      pipes: {
        '0,1,1,3': {},
        '0,1,4,5': {},
        '4,5,1,3': {},
        '2,3,4,5': {},
      },
    }

    const oldCoord = '1,2'
    const newCoord = '4,5'

    expect(dragNode(graph, oldCoord, newCoord)).toEqual(newGraph)
  })
})
