import React, { useRef, useEffect, useState, useCallback } from 'react'
import './App.css'
import Draggable from 'react-draggable'
import {
  addPipe,
  addNode,
  dragNode,
  getNodeMatrix,
  changePipe,
  changeNode,
} from './PipeGraph/index'

const Node = props => {
  const handleDrag = (e, data) => {
    props.dragNode(e, data, props.id)
  }
  const x = props.coord.split(',')[0] - 10
  const y = props.coord.split(',')[1] - 10
  return (
    <div>
      <Draggable
        defaultPosition={{
          x: x,
          y: y,
        }}
        grid={[20, 20]}
        onDrag={(e, data) => handleDrag(e, data)}
      >
        <div
          className="pivot"
          onClick={e => props.handlePipe(e, props.id)}
        ></div>
      </Draggable>
    </div>
  )
}

const Pipe = props => {
  const coords = props.coord.split(',')
  const x1 = coords[0]
  const y1 = coords[1]
  const x2 = coords[2]
  const y2 = coords[3]

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      onClick={e => props.onClickPipe(props.id)}
      style={{ stroke: '#4A4A4A', strokeWidth: '10px' }}
    />
  )
}

function round(number, increment) {
  return Math.round(number / increment) * increment
}

const PipeInfo = props => {
  const [length, setLength] = useState(props.pipe.length)
  const [diameter, setDiameter] = useState(props.pipe.diameter)
  const [roughness, setRoughness] = useState(props.pipe.roughness)
  console.log('PIPE', props.pipe)
  const handleSubmitLength = () => {
    const value = Number(length)
    if (!isNaN(value)) {
      const newAttributes = { ...props.pipe, length: value }
      props.handleChangePipe(props.pipe.id, newAttributes)
    }
  }

  const handleSubmitDiameter = () => {
    const value = Number(diameter)
    if (!isNaN(value)) {
      const newAttributes = { ...props.pipe, diameter: value }
      props.handleChangePipe(props.pipe.id, newAttributes)
    }
  }

  const handleSubmitRoughness = () => {
    const value = Number(roughness)
    if (!isNaN(value)) {
      const newAttributes = { ...props.pipe, roughness: value }
      props.handleChangePipe(props.pipe.id, newAttributes)
    }
  }

  const handleSetLength = e => {
    const value = e.target.value
    setLength(value)
  }

  const handleSetDiameter = e => {
    const value = e.target.value
    setDiameter(value)
  }

  const handleSetRoughness = e => {
    const value = e.target.value
    setRoughness(value)
  }

  return (
    <div>
      <h2>{`Pipe Id: ${props.pipe.id}`}</h2>
      <label>
        Length:
        <input type="text" value={length} onChange={handleSetLength} />
        <button onClick={handleSubmitLength}>Submit</button>
      </label>
      <label>
        Diameter:
        <input type="text" value={diameter} onChange={handleSetDiameter} />
        <button onClick={handleSubmitDiameter}>Submit</button>
      </label>
      <label>
        Roughness:
        <input type="text" value={roughness} onChange={handleSetRoughness} />
        <button onClick={handleSubmitRoughness}>Submit</button>
      </label>
    </div>
  )
}

const NodeInfo = props => {
  return (
    <div>
      <div>NODE</div>
      <div>{props.node.fixed ? 'FIXED' : 'NON-FIXED'}</div>
      <div>{props.node.elevation}</div>
    </div>
  )
}

const InfoPanel = props => {
  const pipe = props.graph.pipes[props.showInfo.id]
  const node = props.graph.nodes[props.showInfo.id]

  if (pipe) {
    return (
      <PipeInfo
        key={pipe.id}
        pipe={pipe}
        handleChangePipe={props.handleChangePipe}
      ></PipeInfo>
    )
  } else if (node) {
    return <NodeInfo node={node}></NodeInfo>
  } else {
    return null
  }
}

function App() {
  const workspaceRef = useRef()
  const [graph, setGraph] = useState({ nodes: {}, pipes: {} })
  const [pipeInProgress, setPipeInProgress] = useState(false)
  const [showInfo, setShowInfo] = useState({ type: null, id: null })

  const handleChangePipe = (pipeId, attributes) => {
    const pipeKey = Object.keys(graph.pipes).filter(
      key => graph.pipes[key].id === pipeId,
    )[0]
    console.log(Object.keys(graph.pipes), pipeId)
    setGraph(changePipe(graph, pipeKey, attributes))
  }

  const handleAddNode = e => {
    if (e.shiftKey) {
      const rect = workspaceRef.current.getBoundingClientRect()
      const left = rect.left
      const top = rect.top
      const x = round(e.clientX - left, 20)
      const y = round(e.clientY - top, 20)
      const currentCoordinates = Object.keys(graph.nodes).map(key =>
        key.slice(','),
      )
      if (!currentCoordinates.includes([x, y])) {
        setGraph(
          addNode(graph, [x, y], {
            id: `${Math.random()}`,
            fixed: false,
            elevation: 0,
          }),
        )
      }
    }
  }

  const handleDragNode = (e, data, oldId) => {
    const x = data.x + 10
    const y = data.y + 10
    const newId = `${x},${y}`
    console.log('DRAG', oldId, newId)
    console.log('newGraph', dragNode(graph, oldId, newId))
    setGraph(dragNode(graph, oldId, newId))
  }

  useEffect(() => {
    console.log(getNodeMatrix(graph, false))
    console.log(graph)
  }, [graph])

  const handlePipe = (e, id) => {
    if (e.altKey) {
      if (!pipeInProgress) {
        setPipeInProgress([true, id])
      } else {
        const newGraph = addPipe(
          graph,
          { id: Math.random(), length: 1, diameter: 1, roughness: 0.01 },
          pipeInProgress[1].split(',').map(coord => Number(coord)),
          id.split(',').map(coord => Number(coord)),
        )
        setGraph(newGraph)
        setPipeInProgress(false)
      }
    } else {
      setShowInfo({ type: 'node', id: id })
    }
  }

  const onClickPipe = id => {
    setShowInfo({ type: 'pipe', id: id })
  }

  return (
    <div className="App">
      <div className="toolbar">
        <button className="toolbarButton">+</button>
        <button className="toolbarButton">
          <svg width="11" height="13" viewBox="0 0 11 13" fill="none">
            <path
              d="M10.4972 6.50046L0.337715 12.3661L0.337715 0.634859L10.4972 6.50046Z"
              fill="#4A4A4A"
            />
          </svg>
        </button>
      </div>

      <div className="workspace" ref={workspaceRef} onClick={handleAddNode}>
        {Object.keys(graph.nodes).map(coord => {
          return (
            <Node
              dragNode={handleDragNode}
              handlePipe={handlePipe}
              coord={coord}
              key={graph.nodes[coord].id}
              id={coord}
            ></Node>
          )
        })}
        <svg height="210" width="500">
          {Object.keys(graph.pipes).map(coord => {
            return (
              <Pipe
                coord={coord}
                key={coord}
                id={coord}
                onClickPipe={onClickPipe}
              ></Pipe>
            )
          })}
        </svg>
        <div className="gridLines" />
      </div>

      <div className="infoPanel">
        <InfoPanel
          handleChangePipe={handleChangePipe}
          showInfo={showInfo}
          graph={graph}
          setGraph={setGraph}
        ></InfoPanel>
      </div>
    </div>
  )
}

export default App
