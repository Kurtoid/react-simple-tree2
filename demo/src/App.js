import React from 'react';
import SimpleTree from '../../src';

// simple driver
/*
let data = {
  id: 0,
  name: "root",
  children: [
    { name: "sub1", id: 1 }, { name: "sub2", id: 2 }
  ]
}
//*/
class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [
        { id: 1, title: "root", parent: null },
        { id: 2, title: "sub1", parent: 1, collapsed: true },
        { id: 3, title: "sub2", parent: 1 },
        { id: 4, title: "1sub1", parent: 2 },
        { id: 5, title: "1sub2", parent: 2 }
      ],
      nextNodeId: 6,
    }
    this.setNodeParent = this.setNodeParent.bind(this)
    this.addNode = this.addNode.bind(this)
  }
  setNodeParent(parentId, childId) {
    console.log("set parent " + parentId + " " + childId)
    console.log("set parent " + typeof (parentId) + " " + typeof (childId))
    if (parentId === childId) {
      return
    }
    let childNode = null
    for (let i = 0; i < this.state.data.length; i++) {
      if (this.state.data[i].id === childId) {
        childNode = this.state.data[i]
        break
      }
    }
    childNode.parent = parentId
    this.setState({ data: this.state.data })
    console.log(this.state.data)
  }
  addNode() {
    console.log("adding new node to state")
    const { nextNodeId } = this.state
    this.setState({ data: [...this.state.data, { id: nextNodeId, parent: Math.floor(Math.random() * (nextNodeId - 1)) + 1, title: "newNode" + nextNodeId }], nextNodeId: nextNodeId + 1 })

  }
  render() {
    const { data } = this.state
    return (
      <div className="App">
        <SimpleTree data={data} setParent={this.setNodeParent} getNodeName={(node) => node.title} />
        <button onClick={this.addNode} >add node</button>
        {/* <button onClick={removeNode} >remove node</button> */}
      </div>
    );
  }
}

export default App;
