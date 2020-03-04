import React, { Component, useRef } from 'react'
import PropTypes from 'prop-types'
import styles from './styles.css'
import { DndProvider, useDrop } from 'react-dnd'
import Backend from 'react-dnd-html5-backend'
import { ItemTypes } from './constants'
import { useDrag } from 'react-dnd'

function NodeLabel(props) {
  const ref = useRef(null)
  const handleNodeClick = () => {
    const { onClick, nodeId } = props
    onClick(nodeId)
  }
  const { nodeId, subNodes } = props
  const [{ isDragging }, drag] = useDrag({
    item: { type: ItemTypes.NodeLabel, nodeId: nodeId },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  })
  const [, drop] = useDrop({
    accept: ItemTypes.NodeLabel,
    drop(item, monitor) {
      if (!ref.current) {
        return
      }
      let droppedNode = item.nodeId;
      console.log("dropped " + droppedNode + " on " + nodeId)
      if (!droppedNode) {
        return
      }
      // if (droppedNode === nodeId) {
      // return
      // }
      props.setParent(nodeId, droppedNode)
    }
  })
  let node = props.nodes.get(nodeId)
  let bullet = ">"
  if (node.collapsed || subNodes === undefined) {
    bullet = "*";
  }
  if (nodeId !== null) {
    drag(drop(ref))
  }
  return (
    <li >
      <div ref={ref} onClick={handleNodeClick}>{bullet} {node.data.name}</div>
      {subNodes}
    </li>
  )
}
class SimpleTree extends React.Component {
  constructor(props) {
    super(props);
    const { data } = props
    let nodes = new Map()
    data.forEach((originalNode) => {
      nodes.set(originalNode.id, { collapsed: false, data: originalNode })
    })
    this.state = {
      nodes: nodes,
    }
    console.log("init nodes")
    console.log(nodes)
    this.handleNodeClick = this.handleNodeClick.bind(this)
    this.setParent = this.setParent.bind(this)
  }
  getRootNode() {
    const { nodes } = this.state;
    for (let [key, value] of nodes) {
      if (value.data.parent === null) {
        return Number(key)
      }
    }
    return null;
  }
  getChildren(nodeId) {
    // console.log("finding children for " + nodeId)
    // console.log(typeof (nodeId))
    const { nodes } = this.state;
    let ret = []
    for (let [key, value] of nodes) {
      // console.log("checking " + key + ": " + value.parent)
      // console.log(typeof (value.parent))
      if (value.data.parent === nodeId) {
        ret.push(key);
      }
    }
    // console.log("children for " + nodeId)
    // console.log(ret)
    return ret;
  }
  handleNodeClick(nodeId) {
    console.log("node clicked: " + nodeId)
    const { nodes } = this.state
    let node = nodes.get(nodeId)
    if (node === null) {
      return
    }
    if (node.collapsed === undefined) {
      node.collapsed = true;
    } else {
      node.collapsed = !node.collapsed
    }
    this.setState({ nodes: nodes })
  }
  // called when a new node is added or removed
  syncNodes() {

  }
  setParent(parentId, childId) {
    console.log("setting parent")
    this.syncNodes()
    this.props.setParent(parentId, childId)
  }
  renderNode(nodeId) {
    const { nodes } = this.state
    let children = this.getChildren(nodeId)
    let rows = []
    for (let i = 0; i < children.length; i++) {
      rows.push(this.renderNode(children[i]))
    }
    let subNodes;
    if (rows.length > 0 && !nodes.get(nodeId).collapsed) {
      subNodes = <ul>{rows}</ul>
    }
    return (
      <NodeLabel nodes={nodes} nodeId={nodeId} key={nodeId} subNodes={subNodes} onClick={this.handleNodeClick} setParent={this.setParent} />
    )
  }
  render() {
    return (
      <DndProvider backend={Backend}>
        <div>
          <ul>
            {this.renderNode(this.getRootNode())}
          </ul>
        </div>
      </DndProvider>
    )
  }
}
export default SimpleTree