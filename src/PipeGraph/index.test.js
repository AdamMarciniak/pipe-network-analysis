// test('renders learn react link', () => {
//   const { getByText } = render(<App />)
//   const linkElement = getByText(/learn react/i)
//   expect(linkElement).toBeInTheDocument()
// })

import { addPipe, addNode, coordsToKey, lineToKey } from './index'

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

  test('produces different results for [1,1], [0,0] and [1,0], [0,1]', () => {
    expect(lineToKey([1, 1], [0, 0])).not.toEqual(lineToKey([1, 0], [0, 1]))
  })

  test('produces the same result for [1,2], [1,0] and [1,0], [1,2]', () => {
    expect(lineToKey([1, 2], [3, 0])).toEqual(lineToKey([3, 0], [1, 2]))
  })
})

describe('addPipe', () => {
  test('produces new graph with pipe between given nodes', () => {
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

  test('produces graph with pipe and attributes set ', () => {
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

  test('throws error if pipe already in initialGraph', () => {
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

    expect(() =>
      addPipe(initialGraph, pipeAttributes, fromNode, toNode),
    ).toThrow()
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
