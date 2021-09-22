import React from 'react';
import "./Node.css"


function Node({i, j, grid, startNode, endNode, visited, isbarrier}) {

  return (
    <div className={`node ${visited ? "isVisited" : ""} ${isbarrier ? "isbarrier" : ""} ${startNode? "isStart" : endNode? "isEnd" : ""}`}>

    </div>
  );
}

export default Node;
