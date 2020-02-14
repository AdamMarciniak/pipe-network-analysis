const pipes = [
  {
    id: 0,
    point1: { id: 0, coord: [100, 100], group: null },
    point2: { id: 0, coord: [100, 200], group: null },
  },
  {
    id: 1,
    point1: { id: 0, coord: [100, 100], group: null },
    point2: { id: 0, coord: [200, 100], group: null },
  },
  {
    id: 2,
    point1: { id: 0, coord: [100, 200], group: null },
    point2: { id: 0, coord: [200, 100], group: null },
  },
  {
    id: 3,
    point1: { id: 0, coord: [100, 100], group: null },
    point2: { id: 0, coord: [50, 50], group: null },
  },
]

const getGraph = pipes => {
  const isSamePoint = (point1, point2) => {
    if (point1.length !== point2.length || point1.length > 2) {
      throw new Error('Point array length is not matching or not 2')
    }
    if (point1[0] !== point2[0] || point1[1] !== point2[1]) {
      return false
    }
    return true
  }

  const groups = []
  const coordsList = []

  const containsCoords = (coordsList, coords) => {
    for (let i = 0; i < coordsList.length; i += 1) {
      if (isSamePoint(coordsList[i][1], coords)) {
        return true
      }
    }

    return false
  }

  pipes.forEach(pipe1 => {
    pipes.forEach(pipe2 => {
      if (pipe1.id !== pipe2.id) {
        if (isSamePoint(pipe1.point1.coord, pipe2.point1.coord)) {
          if (!containsCoords(coordsList, pipe1.point1.coord)) {
            coordsList.push([groups.length, pipe1.point1.coord])
            pipe1.point1.group = groups.length
            pipe2.point1.group = groups.length
            groups.push(groups.length)
          } else {
            const group = coordsList.filter(coord =>
              isSamePoint(coord[1], pipe1.point1.coord),
            )[0][0]
            pipe1.point1.group = group
            pipe2.point1.group = group
          }
        }

        if (isSamePoint(pipe1.point2.coord, pipe2.point2.coord)) {
          if (!containsCoords(coordsList, pipe1.point2.coord)) {
            coordsList.push([groups.length, pipe1.point2.coord])
            pipe1.point2.group = groups.length
            pipe2.point2.group = groups.length
            groups.push(groups.length)
          } else {
            const group = coordsList.filter(coord =>
              isSamePoint(coord[1], pipe1.point2.coord),
            )[0][0]
            pipe1.point2.group = group
            pipe2.point2.group = group
          }
        }

        if (isSamePoint(pipe1.point1.coord, pipe2.point2.coord)) {
          if (!containsCoords(coordsList, pipe1.point1.coord)) {
            coordsList.push([groups.length, pipe1.point1.coord])
            pipe1.point1.group = groups.length
            pipe2.point2.group = groups.length
            groups.push(groups.length)
          } else {
            const group = coordsList.filter(coord =>
              isSamePoint(coord[1], pipe1.point1.coord),
            )[0][0]
            pipe1.point1.group = group
            pipe2.point2.group = group
          }
        }

        if (isSamePoint(pipe1.point2.coord, pipe2.point1.coord)) {
          if (!containsCoords(coordsList, pipe1.point2.coord)) {
            coordsList.push([groups.length, pipe1.point2.coord])
            pipe1.point2.group = groups.length
            pipe2.point1.group = groups.length
            groups.push(groups.length)
          } else {
            const group = coordsList.filter(coord =>
              isSamePoint(coord[1], pipe1.point2.coord),
            )[0][0]
            pipe1.point2.group = group
            pipe2.point1.group = group
          }
        }
      }
    })
  })

  pipes.forEach(pipe => {
    if (pipe.point1.group === null) {
      pipe.point1.group = groups.length
      groups.push(groups.length)
    }
    if (pipe.point2.group === null) {
      pipe.point2.group = groups.length
      groups.push(groups.length)
    }
  })

  const graph = []
  pipes.forEach(pipe => {
    graph.push([pipe.point1.group, pipe.point2.group])
  })

  return { graph: graph, coords: coordsList }
}

console.log(getGraph(pipes))

// O((1 + 1)(3 + 3))= O(12)
// O((2)(16)) = O(32)  increased O X 3
// O((13)(5 + 8)) = O(65) increase O X 169
