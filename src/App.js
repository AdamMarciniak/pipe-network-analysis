import React, { useRef, useEffect, useState, useCallback } from 'react'
import './App.css'
import Draggable from 'react-draggable'
import { addPipe, addNode, dragNode } from './PipeGraph/index'

const Node = props => {
  const handleDrag = e => {
    props.dragNode(e, props.id)
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
        onDrag={handleDrag}
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
        setGraph(addNode(graph, [x, y], {}))
      }
    }
  }

  const handleDragNode = (e, oldId) => {
    const rect = workspaceRef.current.getBoundingClientRect()
    const left = rect.left
    const top = rect.top
    const x = round(e.clientX - left, 20)
    const y = round(e.clientY - top, 20)
    const newId = `${x},${y}`
    console.log(oldId, newId)
    setGraph(dragNode(graph, oldId, newId))
  }

  useEffect(() => {
    console.log(graph)
  }, [graph])

  const handlePipe = (e, id) => {
    console.log(id.split(',').map(coord => Number(coord)))
    if (!pipeInProgress) {
      setPipeInProgress([true, id])
    } else {
      const newGraph = addPipe(
        graph,
        {},
        pipeInProgress[1].split(',').map(coord => Number(coord)),
        id.split(',').map(coord => Number(coord)),
      )
      setGraph(newGraph)
      setPipeInProgress(false)
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
              key={coord}
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
