import React, { useRef, useEffect, useState, useCallback } from 'react'
import './App.css'
import Draggable from 'react-draggable'
import { addPipe, addNode, dragNode, getNodeMatrix } from './PipeGraph/index'

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
      style={{ stroke: 'rgb(255,0,0)', strokeWidth: '2px' }}
    />
  )
}

function round(number, increment) {
  return Math.round(number / increment) * increment
}

function App() {
  const workspaceRef = useRef()
  const [graph, setGraph] = useState({ nodes: {}, pipes: {} })
  const [pipeInProgress, setPipeInProgress] = useState(false)

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
          addNode(graph, [x, y], { id: `${Math.random()}`, fixed: false }),
        )
      }
    }
  }

  // TO DO. Need to figure out how to get nodes to drag and pipes to drag with them.
  // The way it's done currently deletes the node and puts  new one in it's place when dragging
  // This oesn't work because the drag event was on the original node.
  // Maybe implement a node ID attribute in the graph.
  // That way, the node itself will stay just the coordinates will change.
  // Node ID is no longer the coordinates of the node.
  // May need to modify functions to be ok with ID attribute for each node.

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
  }, [graph])

  const handlePipe = (e, id) => {
    if (e.altKey) {
      if (!pipeInProgress) {
        setPipeInProgress([true, id])
      } else {
        const newGraph = addPipe(
          graph,
          { id: Math.random() },
          pipeInProgress[1].split(',').map(coord => Number(coord)),
          id.split(',').map(coord => Number(coord)),
        )
        setGraph(newGraph)
        setPipeInProgress(false)
      }
    }
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
            return <Pipe coord={coord} key={coord} id={coord}></Pipe>
          })}
        </svg>
        <div className="gridLines" />
      </div>

      <div className="infoPanel"></div>
    </div>
  )
}

export default App
