import './App.css';
import React, {useState, useEffect} from 'react';
import Button from '@mui/material/Button';
import Node from './Node';
import Board from './board';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const numRows = 27;
const numCollums = 57;
const isStart = [13, 11];
const isEnd = [13, 43];

function App() {

  const [runBreadth, setRunBreadth] = useState(false);
  const [runDepth, setRunDepth] = useState(false);
  const [barrier, setBarrier] = useState(false);
  const [running, setRunning] = useState(false);
  const [grid, setGrid] = useState(() => {
    const rows = []
    for (let i = 0; i < numRows; i++) {
      const currentRow = []
      for (let j = 0; j < numCollums; j++) {
        const node = {
          visited: false,
          i,
          j,
          isPath: false,
          isbarrier: false,
          preNode: null,
          checked: false,
          weight: 0,
          distance: Infinity,
          startNode: i === 13 && j===11,
          endNode: i === 13 && j===43,
        }
      currentRow.push(node)
      }
      rows.push(currentRow)
    }
    return rows
  })

  useEffect(async() => {
    if (runBreadth || runDepth) {
    const nodeVisited = [isStart];
      while (nodeVisited.length > 0) {
        let currentNode;
        if (runBreadth) { 
          currentNode = nodeVisited.shift()
        }
        if (runDepth) { 
          currentNode = nodeVisited.pop()
        }
        if (JSON.stringify(currentNode) === JSON.stringify(isEnd)) {
          await constructPath();
          if (runDepth) {
            setRunDepth(false)
          };
          if (runBreadth) {
            setRunBreadth(false)
        };
        break;
      }
        if (runDepth) { 
          let newGrid = [...grid];
          grid[currentNode[0]][currentNode[1]]['visited'] = true;
          setGrid(newGrid);
          await wait(0.01) 
        }
        console.log(nodeVisited)
        const neighbors = [
          [currentNode[0], currentNode[1]-1],
          [currentNode[0]+1, currentNode[1]],
          [currentNode[0], currentNode[1]+1],
          [currentNode[0]-1, currentNode[1]]
        ]
        for (let k = 0; k < neighbors.length; k++ ) {
          const newI = neighbors[k][0]
          const newJ = neighbors[k][1]
          if (newI >= 0 && newI < numRows && newJ >= 0 && newJ < numCollums) {
            if (grid[newI][newJ]['visited'] === false && grid[newI][newJ]['isbarrier'] === false) {
              nodeVisited.push([newI, newJ]);
              if (runBreadth) { 
                let newGrid = [...grid];
                grid[newI][newJ]['visited'] = true; 
                setGrid(newGrid);
                await wait(0.01) 
            }
              grid[newI][newJ]['preNode'] = currentNode;
              }   
            };
          };
        }
  }}, [runBreadth, runDepth])

   
  const Dijkastra = async() => {
      const nodeVisited = [isStart];
      while (nodeVisited.length > 0) {
        const currentNode = nodeVisited.shift()
        let newGrid = [...grid];
        grid[currentNode[0]][currentNode[1]]['visited'] = true;
        setGrid(newGrid);

        if (JSON.stringify(currentNode) === JSON.stringify(isEnd)) {
          constructPath();
          break;
        };

        const neighbors = [
          [currentNode[0], currentNode[1]-1],
          [currentNode[0]+1, currentNode[1]],
          [currentNode[0], currentNode[1]+1],
          [currentNode[0]-1, currentNode[1]]
        ]
        await wait(0.1) 
        for (let k = 0; k < neighbors.length; k++ ) {
          const newI = neighbors[k][0]
          const newJ = neighbors[k][1]
          if (newI >= 0 && newI < numRows && newJ >= 0 && newJ < numCollums) {
            if (grid[newI][newJ]['visited'] === false && grid[newI][newJ]['isbarrier'] === false) {
              const newDis = grid[currentNode[0]][currentNode[1]]['distance'] + 1
              if (newDis < grid[newI][newJ]['distance'] || CheckCurrentNode(nodeVisited, [newI, newJ]) === false) {
                let newGrid = [...grid];
                grid[newI][newJ]['distance'] = newDis;
                grid[newI][newJ]['preNode'] = currentNode;
                setGrid(newGrid);
              }
              if (CheckCurrentNode(nodeVisited, [newI, newJ]) === false) {
                nodeVisited.push([newI, newJ]);
              }
            }   
          };
        };
      }
    }

  const AStar = async() => {
      let nodeToVisited = [isStart];
      while (nodeToVisited.length > 0) {
        let currentNode = nodeToVisited[0]
        currentNode = await getClosetNode(nodeToVisited, currentNode);
        nodeToVisited = nodeToVisited.filter(function(item) {return item !== currentNode})

        if (JSON.stringify(currentNode) === JSON.stringify(isEnd)) {
          constructPath();
          break;
        };

        let newGrid = [...grid];
        grid[currentNode[0]][currentNode[1]]['visited'] = true;
        setGrid(newGrid);
        await wait(0.01) 

        const neighbors = [
          [currentNode[0], currentNode[1]-1],
          [currentNode[0]+1, currentNode[1]],
          [currentNode[0], currentNode[1]+1],
          [currentNode[0]-1, currentNode[1]]
        ]

        for (let k = 0; k < neighbors.length; k++ ) {
          const newI = neighbors[k][0]
          const newJ = neighbors[k][1]
          if (newI >= 0 && newI < numRows && newJ >= 0 && newJ < numCollums) {
            if (grid[newI][newJ]['visited'] === false && grid[newI][newJ]['isbarrier'] === false) {
              const newDis = manhattanDistance(newI, newJ, isEnd) + grid[newI][newJ]['weight']
              if (CheckCurrentNode(nodeToVisited, [newI, newJ]) === false || grid[newI][newJ]['distance'] > newDis) {
                  grid[newI][newJ]['distance'] = newDis;
                  grid[newI][newJ]['preNode'] = currentNode;
                  grid[newI][newJ]['weight'] = grid[currentNode[0]][currentNode[1]]['weight'] + 1
                  if (nodeToVisited.includes([newI, newJ]) === false) {
                    nodeToVisited.push([newI, newJ]);
                  }
                }
              }
            }
          }
        }
      }

  const CheckCurrentNode = (arr, node) => {
    for (let i=0; i < arr.length; i++) {
      let current = arr[i];
      if (JSON.stringify(current) === JSON.stringify(node)) {
        return true
      }
    }
    return false
  }

  const IDAStar = async(path, gCost, threshold) => {
    const currentNode = path.slice(-1)[0]
    const fCost = gCost + manhattanDistance(currentNode[0], currentNode[1], isEnd)
    console.log(currentNode)
    if (JSON.stringify(currentNode) === JSON.stringify(isEnd)) {
      return true
    };

    if (fCost > threshold) {
      return fCost
    }

    const neighbors = [
      [currentNode[0], currentNode[1]-1],
      [currentNode[0]+1, currentNode[1]],
      [currentNode[0], currentNode[1]+1],
      [currentNode[0]-1, currentNode[1]]
    ]

    let newGrid = [...grid];
    grid[currentNode[0]][currentNode[1]]['visited'] = true; 
    setGrid(newGrid);

    let min = Infinity;
    for (let k = 0; k < neighbors.length; k++ ) {
      const newI = neighbors[k][0]
      const newJ = neighbors[k][1]
      if (newI >= 0 && newI < numRows && newJ >= 0 && newJ < numCollums) {
        if (grid[newI][newJ]['isbarrier'] === false && CheckCurrentNode(path, [newI, newJ])===false) { 
          path.push([newI, newJ]);
          let newGrid = [...grid];
          grid[newI][newJ]['preNode'] = currentNode;
          setGrid(newGrid);
          let temp = await IDAStar(path, gCost++, threshold);
          if (temp === true) {
            return true
          } 
          if (temp < min) {
            min = temp
          }
          path.pop()
        }  
      }
    }
    await wait(0.1)
    return min 
  }

  const IDARun = async() => {
    let threshold = manhattanDistance(isStart[0], isStart[1], isEnd);
    let path = [isStart]
    while (true) {
      let result = await IDAStar(path, 0, threshold)

      if (result === true) {
        constructPath();
        return;
      }
      if (result === Infinity) {
        return;
      }

      const newGrid = [...grid] 
      for (let i=0; i < numRows; i++) {
        for (let j=0; j < numCollums; j++) {
          grid[i][j]['visited'] = false
        }}
      setGrid(newGrid)
      threshold = result
    }
  }

  const getClosetNode = async (nodeToVisited, currentNode) => {
    if (JSON.stringify(currentNode) === JSON.stringify(isStart)) {
      return isStart
    }
    let min = Infinity;
    let minNode;
    for (let i=0; i < nodeToVisited.length; i++) {
      let item = nodeToVisited[i]
      if (grid[item[0]][item[1]]['distance'] < min) { 
        min = grid[item[0]][item[1]]['distance'];
        minNode = item
    }
  }
  return minNode
}

  const manhattanDistance = (idx1, idx2, target) => {
    const distance = Math.abs(idx1 - target[0]) + Math.abs(idx2 - target[1]);
    return distance
  }
  
  const constructPath = async() => {
    const path = []
    let currentNode = isEnd
    while (path.length < numRows*numCollums) {
      path.push(currentNode);
      currentNode = grid[currentNode[0]][currentNode[1]]['preNode'];
      if (JSON.stringify(currentNode) === JSON.stringify(isStart)) {
        path.reverse();
        for (let i=0; i<path.length; i++) {
          const currentNodePath = path[i]
          let newGrid = [...grid];
          grid[currentNodePath[0]][currentNodePath[1]]['isPath'] = true;
          setGrid(newGrid);
          await wait(0.1)  
        }
        setRunning(false);
        break;
      }
    }}

  const wait = (ms) => {
    return new Promise(r => setTimeout(r, ms))
  }


  const handleBt = (i, j) => {
    if (barrier === true) {
      const newGrid = [...grid];
      grid[i][j]['isbarrier'] = !grid[i][j]['isbarrier'];
      setGrid(newGrid)
    }
  }

  const BarrierBt = () => {
    if (barrier === false) {
      setBarrier(true)
    } else {
      setBarrier(false)
    }   
  }

  const resetBt = () => {
    const newGrid = [...grid] 
    grid.map((rows, i) => 
      rows.map((node, j) => (
        grid[i][j]['isbarrier'] = false,
        grid[i][j]['isPath'] = false,
        grid[i][j]['visited'] = false,
        grid[i][j]['weight'] = 0,
        grid[i][j]['preNode'] = null,
        grid[i][j]['distance'] = Infinity,
        grid[i][j]['checked'] = false
      )))
    setGrid(newGrid)
    }

  const clearPath = () => {
    const newGrid = [...grid] 
    grid.map((rows, i) => 
      rows.map((node, j) => (
        grid[i][j]['isPath'] = false,
        grid[i][j]['visited'] = false
      )))
    setGrid(newGrid)
  }

  return (
    <div>
      <div className="head">
        <div className="dropBox"> 
          <div className="algorithm">
              <Button className="icon">Algorithm
                <ArrowDropDownIcon>
                </ArrowDropDownIcon>
              </Button>
            <ul>
              <li onClick={() => {
                if (running === false){
                  setRunning(true);
                  setRunBreadth(true)}}}>Breadth First Search</li>
              <li onClick={() => {
                if (running === false){
                  setRunning(true);
                  setRunDepth(true)}}}>Deth First Search</li>
              <li onClick={() => {
                if (running === false){
                  setRunning(true);
                  let newGrid = [...grid];
                  grid[isStart[0]][isStart[1]]['distance'] = 0;
                  setGrid(newGrid);
                  Dijkastra()}}}>Dijkastra's Search</li>
              <li onClick={() => {
                if (running === false){
                  setRunning(true);
                  AStar()}}}>A* Search</li>
              <li onClick={() => {
                if (running === false){
                  setRunning(true);
                  IDARun()}}}>IDA* Search</li>
            </ul> 
          </div>
          <Board grid={grid} setGrid={setGrid} 
          numRows = {numRows} numCollums = {numCollums}
          isEnd = {isEnd} running = {running} setRunning = {setRunning}/>

          <Button className="buttonAL"
            onClick={() => {
              if (running === false){
                BarrierBt()}}}>ADD WALLS
          </Button>

          <Button className="buttonAL"
            onClick={() => {
              if (running === false){
                resetBt()}}}>RESET BOARD
          </Button>

          <Button className="buttonAL"
            onClick={() => {
              if (running === false){
                clearPath()}}}>Clear Path
          </Button>
        </div>
      </div>
      <div className="iconBox">
        <div className="iconNode">
          <div className="startNodeIcon">
          </div>
          <p>Start Point</p>
        </div>
        <div className="iconNode">
          <div className="endNodeIcon">
          </div>
          <p>Target Point</p>
        </div>
        <div className="iconNode">
          <div className="visitNodeIcon">
          </div>
          <p>Visited Node</p>
        </div>
        <div className="iconNode">
          <div className="pathNodeIcon">
          </div>
          <p>Path Node</p>
        </div>
      </div>
      <div className="board"
      style = {{
        display: "grid",
        gridTemplateColumns: `repeat(${numCollums}, 25px)`
      }}>
          {grid.map((rows, i) =>
            rows.map((node, j) => {
              const {startNode, endNode, visited, isbarrier, isPath} = node;
              return (
                <div onMouseOver={() => handleBt(i, j)}>
                  <Node
                    key = {`${i}-${j}`}
                    startNode = {startNode}
                    endNode = {endNode}
                    visited = {visited}
                    isbarrier = {isbarrier}
                    isPath = {isPath}
                    grid = {grid}
                    i = {i}
                    j = {j}
                    />
                </div>
            )}) 
          )}
      </div>
    </div>
  );
}

export default App;