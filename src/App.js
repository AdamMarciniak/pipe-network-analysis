import React, { useRef, useEffect, useState, useCallback } from 'react'
import logo from './logo.svg'
import './App.css'
import Draggable from 'react-draggable'
import findLoops from './getLoops'
import getGraph from './getGraph'

const Pivots = props => {
  const handleDrag1 = (e, data) => {
    const [x, y] = [data.x + 10, data.y + 10]
    props.setPivotPositions({ ...props.pivotPositions, x1: x, y1: y })
  }

  const handleDrag2 = (e, data) => {
    const [x, y] = [data.x + 10, data.y + 10]
    props.setPivotPositions({ ...props.pivotPositions, x2: x, y2: y })
  }

  return (
    <div>
      <Draggable
        defaultPosition={{
          x: props.startPosition.x1 - 10,
          y: props.startPosition.y1 - 10,
        }}
        onDrag={handleDrag1}
        grid={[20, 20]}
      >
        <div className="pivot" ref={props.pivotRef1}>{`1 ${props.id}`}</div>
      </Draggable>

      <Draggable
        defaultPosition={{
          x: props.startPosition.x2 - 10,
          y: props.startPosition.y2 - 10,
        }}
        onDrag={handleDrag2}
        grid={[20, 20]}
      >
        <div className="pivot" ref={props.pivotRef2}>
          2
        </div>
      </Draggable>
    </div>
  )
}

const Line = props => {
  return (
    <svg>
      <line
        className="pipeLine"
        x1={`${props.pivotPositions.x1}`}
        y1={`${props.pivotPositions.y1}`}
        x2={`${props.pivotPositions.x2}`}
        y2={`${props.pivotPositions.y2}`}
      />
    </svg>
  )
}

const Pipe = props => {
  const startPosition = { x1: 400, y1: 400, x2: 500, y2: 500 }
  const [pivotPositions, setPivotPositions] = useState(startPosition)
  const pivotRef1 = useRef(null)
  const pivotRef2 = useRef(null)

  useEffect(() => {
    props.changePipe(props.id, pivotPositions)
  }, [pivotPositions])

  return (
    <div className="pipe">
      <Pivots
        setPivotPositions={setPivotPositions}
        pivotRef1={pivotRef1}
        pivotRef2={pivotRef2}
        startPosition={startPosition}
        setPivotPositions={setPivotPositions}
        pivotPositions={pivotPositions}
        id={props.id}
      />
      <Line pivotPositions={pivotPositions} />
    </div>
  )
}

function areConnectionsEqual(a, b) {
  if (a === b) return true
  if (a == null || b == null) return false
  if (a.length !== b.length) return false
  for (var i = 0; i < a.length; ++i) {
    for (var j = 0; j < a[i].length; ++j) {
      if (a[i][j] !== b[i][j]) return false
    }
  }
  return true
}

function App() {
  const [pipes, setPipes] = useState([
    { id: 0, x1: null, y1: null, x2: null, y2: null },
  ])

  const [connections, setConnections] = useState([])

  const [groups, setGroups] = useState([])

  const [loops, setLoops] = useState([])

  const [polygons, setPolygons] = useState([])

  const addPipe = () => {
    const getNewId = () => {
      if (pipes.length > 0) {
        return pipes[pipes.length - 1].id + 1
      } else {
        return 0
      }
    }

    setPipes([
      ...pipes,
      { id: getNewId(), x1: null, y1: null, x2: null, y2: null },
    ])
  }

  const changePipe = (id, pivots) => {
    const newPipes = pipes.filter(pipe => pipe['id'] !== id)
    setPipes([...newPipes, { id: id, ...pivots }])
  }

  useEffect(() => {
    const newConnections = []
    let idx = 0
    pipes.forEach(pipe => {
      pipes.slice(idx).forEach(otherPipe => {
        if (pipe.id !== otherPipe.id) {
          if (pipe.x1 === otherPipe.x1 && pipe.y1 === otherPipe.y1) {
            newConnections.push({
              ids: [pipe.id, otherPipe.id],
              connectors: [1, 1],
            })
          }

          if (pipe.x2 === otherPipe.x2 && pipe.y2 === otherPipe.y2) {
            newConnections.push({
              ids: [pipe.id, otherPipe.id],
              connectors: [2, 2],
            })
          }

          if (pipe.x1 === otherPipe.x2 && pipe.y1 === otherPipe.y2) {
            newConnections.push({
              ids: [pipe.id, otherPipe.id],
              connectors: [1, 2],
            })
          }

          if (pipe.x2 === otherPipe.x1 && pipe.y2 === otherPipe.y1) {
            newConnections.push({
              ids: [pipe.id, otherPipe.id],
              connectors: [2, 1],
            })
          }
        }
      })
      idx += 1
    })

    if (
      !areConnectionsEqual(newConnections, connections) &&
      newConnections.length !== 0
    ) {
      setConnections(newConnections)
    }
  }, [pipes, setConnections, connections])

  const triggerFind = () => {
    const newPipes = []
    pipes.forEach(pipe => {
      newPipes.push({
        id: pipe.id,
        point1: { id: 0, coord: [pipe.x1, pipe.y1], group: null },
        point2: { id: 0, coord: [pipe.x2, pipe.y2], group: null },
      })
    })
    const graphs = getGraph(newPipes)
    console.log(JSON.stringify(newPipes))
    const loops = findLoops(graphs.graph)
    setLoops(loops)
    setGroups(graphs.coords)
  }

  useEffect(() => {
    const polygons = []
    loops.forEach(loop => {
      const polygon = []
      loop.forEach(node => {
        groups.forEach(group => {
          if (group[0] === node) {
            polygon.push(group[1])
          }
        })
      })
      polygons.push(polygon)
    })
    setPolygons(polygons)
  }, [loops, groups])

  return (
    <div className="App">
      <div className="toolbar">
        <button className="toolbarButton" onClick={addPipe}>
          +
        </button>
        <button className="toolbarButton" onClick={e => triggerFind()}>
          <svg width="11" height="13" viewBox="0 0 11 13" fill="none">
            <path
              d="M10.4972 6.50046L0.337715 12.3661L0.337715 0.634859L10.4972 6.50046Z"
              fill="#4A4A4A"
            />
          </svg>
        </button>
      </div>

      <div className="workspace">
        {pipes.map(pipe => {
          return <Pipe key={pipe.id} id={pipe.id} changePipe={changePipe} />
        })}

        <svg>
          {polygons.map(poly => {
            let polyString = ''
            poly.forEach(coord => {
              polyString += `${coord[0]},${coord[1]} `
            })

            return <polygon key={Math.random()} points={polyString} />
          })}
        </svg>

        {groups.map(group => {
          return (
            <div
              key={'group' + group[0]}
              className="group"
              style={{
                top: `${group[1][1] - 20}px`,
                left: `${group[1][0] - 20}px`,
              }}
            />
          )
        })}
        <div className="gridLines" />
      </div>

      <div className="infoPanel"></div>
    </div>
  )
}

export default App
