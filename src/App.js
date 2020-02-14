import React, { useRef, useEffect, useState, useCallback } from 'react'
import './App.css'
import Draggable from 'react-draggable'

const Node = props => {
  const [positionHistory, setPositionHistory] = useState([
    props.x - 10,
    props.y - 10,
  ])

  const [draggableDisabled, setDraggableDisabled] = useState(false)

  const handleDrag = (e, data) => {
    console.log(data)
    props.setNodes(
      props.nodes.map(node =>
        node.id === props.id
          ? { id: props.id, x: e.x - 10, y: e.y - 10 }
          : node,
      ),
    )
  }

  return (
    <div>
      <Draggable
        defaultPosition={{
          x: props.x - 10,
          y: props.y - 10,
        }}
        grid={[20, 20]}
        onStop={handleDrag}
      >
        <div className="pivot" onClick={e => e.stopPropagation()}></div>
      </Draggable>
    </div>
  )
}

function round(number, increment) {
  return Math.round(number / increment) * increment
}

function App() {
  const [nodes, setNodes] = useState([])
  const workspaceRef = useRef()

  const getNewNodeId = () => {
    const allIds = nodes.map(node => node.id)
    const maxId = Math.max(...allIds)
    return maxId !== -Infinity ? maxId + 1 : 0
  }

  const addNode = e => {
    if (e.shiftKey) {
      const rect = workspaceRef.current.getBoundingClientRect()
      const left = rect.left
      const top = rect.top
      const x = round(e.clientX - left, 20)
      const y = round(e.clientY - top, 20)
      const currentCoordinates = nodes.map(node => [node.x, node.y])
      if (!currentCoordinates.includes([x, y])) {
        setNodes([...nodes, { id: getNewNodeId(), x: x, y: y }])
      }
    }
  }

  useEffect(() => {
    console.log(nodes)
  }, [nodes])

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

      <div className="workspace" ref={workspaceRef} onClick={addNode}>
        {nodes.map(node => {
          return (
            <Node
              x={node.x}
              y={node.y}
              id={node.id}
              nodes={nodes}
              setNodes={setNodes}
            ></Node>
          )
        })}
        <div className="gridLines" />
      </div>

      <div className="infoPanel"></div>
    </div>
  )
}

export default App
