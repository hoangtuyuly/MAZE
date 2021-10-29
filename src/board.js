import React from 'react';
import Button from '@mui/material/Button';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

function Board({grid, setGrid, numRows, numCollums, isEnd, running, setRunning}) {
    const OuterWall = () => {
        for (let i=0; i<numCollums; i++) {
            let newGrid = [...grid];
            grid[0][i]['isbarrier'] = true;
            grid[numRows-1][i]['isbarrier'] = true;
            setGrid(newGrid)
        };
        for (let i=0; i<numRows; i++) {
            let newGrid = [...grid];
            grid[i][0]['isbarrier'] = true;
            grid[i][numCollums-1]['isbarrier'] = true;
            setGrid(newGrid)
        };
    }

    const MazeDivide = async (w, h, x, y) => {
        if (w <= 3 || h <= 3) {
            return;
        }

        let Direction;
        if (w < h) {
            Direction = 'horizontal'
        }
        else if (w > h) {
            Direction = 'vertical'
        } 
        else {
           Direction = 'horizontal'
        }

        let xplace = Direction === 'horizontal' ? (Math.floor(Math.random() * (h-2) / 2)*2 +2) : 0;
        let yplace = Direction === 'horizontal' ? 0 : (Math.floor(Math.random() * (w-2) / 2)*2 +2);

        xplace += x
        yplace += y


        let xgap = Direction === 'horizontal'? 0 : ((Math.floor(Math.random() * (h - 1) / 2)*2) + 1);
        let ygap = Direction === 'horizontal'? ((Math.floor(Math.random() * (w - 1) / 2)*2) + 1) : 0;
        
        xgap += xplace
        ygap += yplace
        
        const xdir = Direction === 'horizontal'? 0 : 1;
        const ydir = Direction === 'horizontal'? 1 : 0;
        
        const wall = Direction === 'horizontal'? w : h

        for (let i=0; i < wall; i++) {
            let newGrid = [...grid];
            grid[xplace][yplace]['isbarrier'] = true;
            setGrid(newGrid);
            xplace += xdir;
            yplace += ydir;
        }

        let newGrid = [...grid];
        grid[xgap][ygap]['isbarrier'] = false;
        setGrid(newGrid);

        let width;
        let height;
        let xchange;
        let ychange;

        await wait(0.1)

        xchange = x
        ychange = y
        width = Direction === 'horizontal' ? w : yplace-y;
        height = Direction === 'horizontal' ? xplace-x : h;
        await MazeDivide(width, height, xchange, ychange);

        xchange = Direction === 'horizontal' ? xplace : x;
        ychange = Direction === 'horizontal' ? y : yplace;
        width = Direction === 'horizontal' ? w : w-yplace+y;
        height = Direction === 'horizontal' ? h-xplace+x : h
        await MazeDivide(width, height, xchange, ychange)
    }



    const Prim = async() => {
     const newGrid = [...grid] 
      grid.map((rows, i) => 
        rows.map((node, j) => (
          grid[i][j]['isbarrier'] = true
      )))
      setGrid(newGrid)
      let path = []
      let x = Math.floor(Math.random() * (numRows-2)/2)*2 + 1;
      let y = Math.floor(Math.random() * (numCollums-2)/2)*2 + 1;
      path.push([x, y]);

      while (path.length > 0) {
        const ranNode =  Math.floor(Math.random() * path.length)
        const currentNode = path[ranNode]

        path = path.filter(function(item) { return item !== currentNode})
        const i = currentNode[0];
        const j = currentNode[1]
        let neighbors = [
          [i, j+2],
          [i+2, j],
          [i, j-2],
          [i-2, j]
        ]

        neighbors = neighbors.filter(
          function(node) {
            if (node[0] >= 1 && node[0] < numRows-1 && node[1] >= 1 && node[1] < numCollums-1) {
              if (grid[node[0]][node[1]]['isbarrier'] === true) {
                return node
              }
            }}
          )

        if (neighbors.length === 0) {
          let newGrid = [...grid];
          grid[i][j]['checked'] = true;
          setGrid(newGrid)
        } else {
          let newGrid = [...grid];
          let ranIdx = Math.floor(Math.random() * neighbors.length)
          let connectNode = neighbors[ranIdx];
          grid[connectNode[0]][connectNode[1]]['isbarrier'] = false;
          const cellBetweenx = (connectNode[0] + i)/2
          const cellBetweeny = (connectNode[1] + j)/2
          grid[cellBetweenx][cellBetweeny]['isbarrier'] = false;
          setGrid(newGrid);
        }

        const frontier = [
          [i, j+2],
          [i+2, j],
          [i, j-2],
          [i-2, j]
        ]

        await wait(0.1);

        for (let k = 0; k < frontier.length; k++ ) {
          const newI = frontier[k][0]
          const newJ = frontier[k][1]
          if (newI >= 1 && newI < numRows-1 && newJ >= 1 && newJ < numCollums-1) {
            if (grid[newI][newJ]['isbarrier'] === false && grid[newI][newJ]['checked'] === false && CheckCurrentNode(path, [newI, newJ]) === false) {
              path.push([newI, newJ]);
          };
        }};
      }
  }
 
    const BinaryTree = async() => {
      for (let i=numRows-1; i > -1; i-=2) {
        for (let j=numCollums-1; j > -1; j-=2) {
          let newGrid = [...grid];
          grid[i][j]['isbarrier'] = true
          setGrid(newGrid)
          const neighbors = [
            [i, j+1],
            [i, j-1],
            [i-1, j],
          ];

          const random = Math.floor(Math.random() * neighbors.length)

          const connectNode = neighbors[random]
          const x = connectNode[0];
          const y = connectNode[1];
          if (x>0 && x<numRows && y>0 && y<numCollums) {
            let newGrid_1 = [...grid];
            grid[x][y]['isbarrier'] = true
            setGrid(newGrid_1)
          }
          await wait(0.1);
        }
      }
    }

    class DisJointSet {
      parent = {}

      makeSet(array){
        for (let i=0; i<array.length; i++) {
          const node = array[i]
          this.parent[node] = node
        }
      }

      find(node) {
        if (this.parent[node] !== node) {
          return this.find(this.parent[node])
        }
        else {
          return node
        }
      }

      union(node_1, node_2) {
        const parent_1 = this.find(node_1)
        const parent_2 = this.find(node_2)
        this.parent[parent_2] = parent_1
      }

      connected(node_1, node_2){
        const parent_1 = this.find(node_1)
        const parent_2 = this.find(node_2)
        if (parent_1 === parent_2) {
          return true
        } else {
          return false
        }
      }   
    }

    const Kruskal = async() => {
      const newGrid = [...grid] 
      grid.map((rows, i) => 
        rows.map((node, j) => (
          grid[i][j]['isbarrier'] = true
      )))
      setGrid(newGrid)

      let path = [];
      let potentialPass = [];

      for (let i=1; i<numRows-1; i+=2) {
        for(let j=2; j<numCollums-1; j+=2) {
          potentialPass.push([i, j])
        }
      }

      for (let i=2; i<numRows-1; i+=2) {
        for(let j=1; j<numCollums-1; j+=2) {
          potentialPass.push([i, j])
        }
      }

      for (let i=1; i<numRows; i+=2) {
        for(let j=1; j<numCollums; j+=2) {
          let newGrid = [...grid];
          grid[i][j]['isbarrier'] = false;
          path.push([i,j])
          setGrid(newGrid)
        }
      }

      potentialPass = shuffle(potentialPass);
      const ds = new DisJointSet();
      ds.makeSet(path);

      while (potentialPass.length > 0) {
        const currentNode = potentialPass.pop();
        const x = currentNode[0];
        const y = currentNode[1];
        if (x%2 === 1) {
          if (ds.connected([x, y-1], [x, y+1])===false) {
            ds.union([x, y-1], [x, y+1])
            let newGrid = [...grid];
            grid[x][y]['isbarrier'] = false;
            setGrid(newGrid)
          };
        } else {
          if (ds.connected([x+1, y], [x-1, y])===false) {
            ds.union([x+1, y], [x-1, y])
            let newGrid = [...grid];
            grid[x][y]['isbarrier'] = false;
            setGrid(newGrid)
          };
        }
        await wait(0.1)
      };
      
    }

    const shuffle = (arr) => {
      for (let i=arr.length-1; i>0; i--) {
        let j = Math.floor(Math.random() * (i+1));
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
      return arr
    }

    const basicRandom = () => {
      for (let i = 0; i < 300; i++) {
        const currentI = Math.floor(Math.random() * numRows) 
        const currentJ =  Math.floor(Math.random() * numCollums) 
        const newGrid = [...grid];
        grid[currentI][currentJ]['isbarrier'] = true;
        setGrid(newGrid)
      }}

    const CheckCurrentNode = (arr, node) => {
      for (let i=0; i < arr.length; i++) {
        let current = arr[i];
        if (JSON.stringify(current) === JSON.stringify(node)) {
          return true
        }
      }
      return false
    }

    const resetBt = () => {
      const newGrid = [...grid] 
      grid.map((rows, i) => 
        rows.map((node, j) => (
          grid[i][j]['isbarrier'] = false,
          grid[i][j]['isPath'] = false,
          grid[i][j]['visited'] = false,
          grid[i][j]['checked'] = false
        )))
      setGrid(newGrid)
      }

  const wait = (ms) => {
    return new Promise(r => setTimeout(r, ms))
  }

  const resetEndNode = () => {
    let newGrid = [...grid];
    grid[isEnd[0]][isEnd[1]]['isbarrier'] = false;
    setGrid(newGrid);
    setRunning(false);
  }

  return (
    <div>
        <div>
            <div className="maze">
              <Button className="icon">Maze Generator
                <ArrowDropDownIcon>
                </ArrowDropDownIcon>
              </Button>
              <ul>
                <li onClick={async() => {
                  if (running === false){
                    setRunning(true);
                    resetBt();
                    OuterWall();
                    await MazeDivide(numCollums-1, numRows-1, 0, 0); 
                    resetEndNode()}
                }}>Recursive Division</li>

                <li onClick={async() => {
                  if (running === false){
                    setRunning(true);
                    resetBt();
                    await Prim();
                    resetEndNode()}
                }}>Prim's Algorithm Maze</li>

                <li onClick={async() => {
                  if (running === false){
                    setRunning(true);
                    resetBt();
                    OuterWall();
                    await BinaryTree();
                    resetEndNode()}
                }}>Binary Tree</li>

                <li onClick={async() => {
                  if (running === false){
                    setRunning(true);
                    resetBt();
                    await Kruskal();
                    resetEndNode();}
                }}>Kruskal's Algorithm Maze</li>

                <li onClick={async() => {
                  if (running === false){
                    setRunning(true);
                    resetBt();
                    await basicRandom();
                    resetEndNode()}
                }}>Basic Random Maze</li>
                
              </ul> 
            </div>
          </div>
    </div>

  );
}

export default Board;