import React, { useRef, useEffect, useState, useCallback } from 'react';
import logo from './logo.svg';
import './App.css';
import Draggable from 'react-draggable';

const Pivots = (props) => {

  const handleDrag1 = (e, data) => {
    console.log('handling1');
    const [x, y] = [data.x + 10, data.y + 10]
    props.setPivotPositions({ ...props.pivotPositions, x1: x, y1: y })
  }

  const handleDrag2 = (e, data) => {
    console.log('handling2');
    const [x, y] = [data.x + 10, data.y + 10]
    props.setPivotPositions({ ...props.pivotPositions, x2: x, y2: y })
  }

  return (
    <div>
      <Draggable defaultPosition={{ x: props.startPosition.x1, y: props.startPosition.y1 }}
        onDrag={handleDrag1}
        grid={[20, 20]}>
        <div className='pivot' ref={props.pivotRef1}
        ></div>
      </Draggable>
      <Draggable defaultPosition={{ x: props.startPosition.x2, y: props.startPosition.y2 }}
        onDrag={handleDrag2}
        grid={[20, 20]}>
        <div className='pivot' ref={props.pivotRef2}
        ></div>
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

const getXYMidPoint = (rect) => {
  return [(rect.right - rect.left) / 2 + rect.left, (rect.bottom - rect.top) / 2 + rect.top];
}

const Pipe = (props) => {

  const startPosition = { x1: 400, y1: 400, x2: 500, y2: 500 }
  const [pivotPositions, setPivotPositions] = useState(startPosition);
  const pivotRef1 = useRef(null);
  const pivotRef2 = useRef(null);


  useEffect(() => {
    const [x1, y1] = getXYMidPoint(pivotRef1.current.getBoundingClientRect());
    setPivotPositions({ ...pivotPositions, x1: x1, y1: y1 });
    const [x2, y2] = getXYMidPoint(pivotRef2.current.getBoundingClientRect());
    setPivotPositions({ ...pivotPositions, x2: x2, y2: y2 })
  }, [])


  return (
    <div className='pipe'>
      <Pivots
        setPivotPositions={setPivotPositions}
        pivotRef1={pivotRef1}
        pivotRef2={pivotRef2}
        startPosition={startPosition}
        setPivotPositions={setPivotPositions}
        pivotPositions={pivotPositions}
      />
      <Line pivotPositions={pivotPositions} />
    </div>
  );
}

function App() {

  const [pipes, setPipes] = useState(['pipe', 'pipe'])

  return (
    <div className="App" >
      <button onClick={(e) => setPipes([...pipes, 'pipe'])}> ADD PIPE!</button>
      {pipes.map((pipe) => {
        return <Pipe />
      })}

    </div>
  );
}

export default App;
