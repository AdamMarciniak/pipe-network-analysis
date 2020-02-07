import React, { useRef, useEffect, useState, useCallback } from 'react';
import logo from './logo.svg';
import './App.css';
import Draggable from 'react-draggable';

const Pivots = (props) => {

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
      <Draggable defaultPosition={{ x: props.startPosition.x1 - 10, y: props.startPosition.y1 - 10 }}
        onDrag={handleDrag1}
        grid={[20, 20]}>
        <div className='pivot' ref={props.pivotRef1}
        >{`1 ${props.id}`}</div>
      </Draggable>

      <Draggable defaultPosition={{ x: props.startPosition.x2 - 10, y: props.startPosition.y2 - 10 }}
        onDrag={handleDrag2}
        grid={[20, 20]}>
        <div className='pivot' ref={props.pivotRef2}
        >2</div>
      </Draggable>
    </div>
  );
}

const Line = (props) => {
  return (
    <svg>
      <line className='pipeLine'
        x1={`${props.pivotPositions.x1}`}
        y1={`${props.pivotPositions.y1}`}
        x2={`${props.pivotPositions.x2}`}
        y2={`${props.pivotPositions.y2}`} />
    </svg>
  );
}

const Pipe = (props) => {
  const startPosition = { x1: 400, y1: 400, x2: 500, y2: 500 }
  const [pivotPositions, setPivotPositions] = useState(startPosition);
  const pivotRef1 = useRef(null);
  const pivotRef2 = useRef(null);

  useEffect(() => {
    props.changePipe(props.id, pivotPositions);
  }, [pivotPositions])

  return (
    <div className='pipe'>
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
  );
}

function App() {

  const [pipes, setPipes] = useState([{ id: 0, x1: null, y1: null, x2: null, y2: null, node1: 0, node2: 1 }])

  const [connections, setConnections] = useState([]);


  const addPipe = () => {
    const getNewId = () => {
      if (pipes.length > 0) {
        return pipes[pipes.length - 1].id + 1;
      } else {
        return 0;
      }
    };
    const maxNode = 0;
    pipes.forEach((pipe) => {
      if (pipe.node1 > maxNode) {
        maxNode = pipe.node1;
      }
      if (pipe.node2 > maxNode) {
        maxNode = pipe.node2;
      }
    })

    setPipes([...pipes, { id: getNewId(), x1: null, y1: null, x2: null, y2: null, node1: maxNode + 1, node2: maxNode + 2 }])
  };

  const changePipe = (id, pivots) => {
    const newPipes = pipes.filter((pipe) => pipe['id'] !== id);
    setPipes([...newPipes, { 'id': id, ...pivots }])
  };

  useEffect(() => {

    const connections = [];
    let idx = 0;
    pipes.forEach((pipe) => {
      pipes.slice(idx).forEach((otherPipe) => {

        if (pipe.id !== otherPipe.id) {
          if (pipe.x1 === otherPipe.x1 && pipe.y1 === otherPipe.y1) {
            connections.push({ ids: [pipe.id, otherPipe.id], connectors: [1, 1] })
          }

          if (pipe.x2 === otherPipe.x2 && pipe.y2 === otherPipe.y2) {
            connections.push({ ids: [pipe.id, otherPipe.id], connectors: [2, 2] })
          }

          if (pipe.x1 === otherPipe.x2 && pipe.y1 === otherPipe.y2) {
            connections.push({ ids: [pipe.id, otherPipe.id], connectors: [1, 2] })
          }

          if (pipe.x2 === otherPipe.x1 && pipe.y2 === otherPipe.y1) {
            connections.push({ ids: [pipe.id, otherPipe.id], connectors: [2, 1] })
          }

        }
      })
      idx += 1;
    })
    setConnections(connections);
    console.log('connections', JSON.stringify(connections));

    console.log(pipes);

  }, [pipes])


  return (
    <div className="App" >
      <div className="toolbar">
        <button className="toolbarButton" onClick={addPipe}>+</button>
        <button className="toolbarButton">
          <svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.4972 6.50046L0.337715 12.3661L0.337715 0.634859L10.4972 6.50046Z" fill="#4A4A4A" />
          </svg>
        </button>
      </div>

      <div className="workspace">
        {pipes.map((pipe) => {
          return <Pipe key={pipe.id} id={pipe.id} changePipe={changePipe} />
        })}
        <div className="gridLines" />
      </div>

      <div className="infoPanel">
        <div>
          Pipe ID and Endpoints
        </div>
        <ul>
          {pipes.sort(function (a, b) {
            return a.id - b.id
          }).map((pipe) => {
            return <PipeRow pipe={pipe} key={pipe.id} id={pipe.id} />
          })}
        </ul>
        <div>
          Connections
        </div>
        <ul>
          {connections.sort(function (a, b) {
            return a.ids[0] - b.ids[0]
          }).map((connection) => {
            return <ConnectionRow key={connection.ids} connection={connection} />
          })}
        </ul>

      </div>
    </div>
  );
}


const PipeRow = (props) => {
  return (
    <li className="pipeRow">
      <div>
        {props.id}
      </div>
      <div>
        x1-
        {props.pipe.x1}
      </div>
      <div>
        y1-
        {props.pipe.y1}
      </div>
      <div>
        x2-
        {props.pipe.x2}
      </div>
      <div>
        y2-
        {props.pipe.y2}
      </div>
    </li>
  )
};

const ConnectionRow = (props) => {
  return (
    <li className="pipeRow">
      <div>
        {props.connection.ids}
      </div>
      <div>
        {props.connection.connectors}
      </div>

    </li>
  )
};


export default App;
