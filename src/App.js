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

import { runSimulation } from './Simulation/index'

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

const pipeRedness = (value, maxValue) => {
  return (255 * value) / maxValue
}

const Pipe = props => {
  const coords = props.coord.split(',')
  const x1 = coords[0]
  const y1 = coords[1]
  const x2 = coords[2]
  const y2 = coords[3]

  const allPipes = Object.values(props.graph.pipes)
  let flow = 0
  for (let i = 0; i < allPipes.length; i += 1) {
    if (allPipes[i].id === props.id) {
      flow = Math.abs(props.flowResults[i])
    }
  }
  const maxFlow = Math.max(...props.flowResults.map(flow => Math.abs(flow)))
  const red = pipeRedness(flow, maxFlow) ? pipeRedness(flow, maxFlow) : 0
  console.log('maxflow', maxFlow)
  console.log('flow', flow)

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      onClick={e => props.onClickPipe(props.coord)}
      style={{ stroke: `rgb(${red},20,20)`, strokeWidth: '10px' }}
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
  const [elevation, setElevation] = useState(props.node.elevation)
  const [demand, setDemand] = useState(props.node.demand)
  const [fixed, setFixed] = useState(props.node.fixed)

  const handleSetElevation = e => {
    const value = e.target.value
    setElevation(value)
  }

  const handleSetDemand = e => {
    const value = e.target.value
    setDemand(value)
  }

  const handleSetFixed = e => {
    const value = e.target.value
    setFixed(value)
  }

  const handleSubmitElevation = () => {
    const value = Number(elevation)
    if (!isNaN(value)) {
      const newAttributes = { ...props.node, elevation: value }
      props.handleChangeNode(props.node.id, newAttributes)
    }
  }

  const handleSubmitDemand = () => {
    const value = Number(demand)
    if (!isNaN(value)) {
      const newAttributes = { ...props.node, demand: value }
      props.handleChangeNode(props.node.id, newAttributes)
    }
  }

  const handleSubmitFixed = () => {
    let value = false
    if (Number(fixed) === 0) {
      value = false
    } else {
      value = true
    }
    if (!isNaN(value)) {
      const newAttributes = { ...props.node, fixed: value }
      props.handleChangeNode(props.node.id, newAttributes)
    }
  }

  return (
    <div>
      <h2>{`Node Id: ${props.node.id}`}</h2>
      <label>
        Type:
        <input type="text" value={fixed} onChange={handleSetFixed} />
        <button onClick={handleSubmitFixed}>Submit</button>
        Elevation:
        <input type="text" value={elevation} onChange={handleSetElevation} />
        <button onClick={handleSubmitElevation}>Submit</button>
        Demand:
        <input type="text" value={demand} onChange={handleSetDemand} />
        <button onClick={handleSubmitDemand}>Submit</button>
      </label>
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
    return (
      <NodeInfo
        node={node}
        key={node.id}
        handleChangeNode={props.handleChangeNode}
      ></NodeInfo>
    )
  } else {
    return null
  }
}

function App() {
  const workspaceRef = useRef()
  const [graph, setGraph] = useState({ nodes: {}, pipes: {} })
  const [pipeInProgress, setPipeInProgress] = useState(false)
  const [showInfo, setShowInfo] = useState({ type: null, id: null })
  const [flowResults, setFlowResults] = useState([])

  const handleSimulate = () => {
    const A1 = getNodeMatrix(graph, false)
    const A2 = getNodeMatrix(graph, true)
    const pipes = Object.values(graph.pipes)
    const nodes = Object.values(graph.nodes)
    const [H, Q] = runSimulation(A1, A2, pipes, nodes)
    setFlowResults(Q)
  }

  const handleChangePipe = (pipeId, attributes) => {
    const pipeKey = Object.keys(graph.pipes).filter(
      key => graph.pipes[key].id === pipeId,
    )[0]
    console.log(Object.keys(graph.pipes), pipeId)
    setGraph(changePipe(graph, pipeKey, attributes))
  }

  const handleChangeNode = (nodeId, attributes) => {
    const nodeKey = Object.keys(graph.nodes).filter(
      key => graph.nodes[key].id === nodeId,
    )[0]
    console.log(Object.keys(graph.nodes), nodeId)
    setGraph(changeNode(graph, nodeKey, attributes))
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
            demand: 0,
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
        <button className="toolbarButton" onClick={handleSimulate}>
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
                key={graph.pipes[coord].id}
                id={graph.pipes[coord].id}
                onClickPipe={onClickPipe}
                graph={graph}
                flowResults={flowResults}
              ></Pipe>
            )
          })}
        </svg>
        <div className="gridLines" />
      </div>

      <div className="infoPanel">
        <InfoPanel
          handleChangePipe={handleChangePipe}
          handleChangeNode={handleChangeNode}
          showInfo={showInfo}
          graph={graph}
          setGraph={setGraph}
        ></InfoPanel>
      </div>
    </div>
  )
}

export default App
