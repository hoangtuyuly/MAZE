import './App.css';
import React, {useState, useEffect, useCallback, useRef, useLayoutEffect} from 'react';
import Button from '@mui/material/Button';
import Node from './Node';
import produce from 'immer'

const numRows = 35;
const numCollums = 50;

function App() {
  const [barrier, setBarrier] = useState(false);
  const [run, setRun] = useState(false);
  const [grid, setGrid] = useState(() => {
    const rows = []
    for (let i = 0; i < numRows; i++) {
      const currentRow = []
      for (let j = 0; j < numCollums; j++) {
        const node = {
          visited: false,
          i,
          j,
          isbarrier: false,
          startNode: i === 15 && j===13,
          endNode: i === 15 && j===35,
        }
      currentRow.push(node)
      }
      rows.push(currentRow)
    }
    return rows
  })

  const isStart = [15, 13];
  const isEnd = [15, 35];
  const nodeVisited = [isStart];
  const BreadthFirstSearch = () => {
              while (nodeVisited.length > 0) {
                const currentNode = nodeVisited.shift()
                if (JSON.stringify(currentNode) == JSON.stringify(isEnd)) {
                  console.log("HERE I AM")
                  break;
                }
                console.log(nodeVisited)
                const neighbors = [
                  [currentNode[0], currentNode[1]+1],
                  [currentNode[0]+1, currentNode[1]],
                  [currentNode[0], currentNode[1]-1],
                  [currentNode[0]-1, currentNode[1]],
                  [currentNode[0]+1, currentNode[1]-1],
                  [currentNode[0]-1, currentNode[1]+1],
                  [currentNode[0]+1, currentNode[1]+1],
                  [currentNode[0]-1, currentNode[1]-1]
                ]
              
                for (let k = 0; k < neighbors.length; k++ ) {
                  setTimeout(() => {
                    const newI = neighbors[k][0]
                    const newJ = neighbors[k][1]
                    if (newI >= 0 && newI < numRows && newJ >= 0 && newJ < numCollums) {
                      if (grid[newI][newJ]['visited'] === false) {
                        nodeVisited.push([newI, newJ]);
                        let newGrid = [...grid];
                        grid[newI][newJ]['visited'] = true;
                        setGrid(newGrid);
                      }   
                    }
                  }, 2000)
                }
            }
          }
    ;


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
    grid.map((rows, i) => 
      rows.map((node, j) => (
        grid[i][j]['isbarrier'] = false
      )))
    let newGrid = [...grid];
    setGrid(newGrid)
    }

  return (
    <div>
      <div>

        <Button 
          onClick={BarrierBt}>BARRIERS
        </Button>

        <Button 
          onClick={resetBt}>RESET
        </Button>

        <Button 
          onClick={() => {
              BreadthFirstSearch()
          }}>BreadthFirstSearch
        </Button>

      </div>
      <div 
      style = {{
        display: "grid",
        gridTemplateColumns: `repeat(${numCollums}, 20px)`
      }}>
          {grid.map((rows, i) =>
            rows.map((node, j) => {
              const {startNode, endNode, visited, isbarrier} = node;
              return (
                <div onMouseOver={() => handleBt(i, j)}>
                  <Node
                    key = {`${i}-${j}`}
                    startNode = {startNode}
                    endNode = {endNode}
                    visited = {visited}
                    isbarrier = {isbarrier}
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