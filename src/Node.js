import React from 'react';
import "./Node.css"


function Node({i, j, grid, startNode, endNode, visited, isbarrier, isPath}) {

  return (
    <div className={`node ${visited ? "isVisited" : ""} ${isPath ? "isPath" : ""} ${isbarrier ? "isbarrier" : ""} ${startNode? "isStart" : endNode? "isEnd" : ""}`}>

    </div>
  );
}

export default Node;
