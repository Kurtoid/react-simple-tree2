import React, { Component, useRef } from 'react'
import PropTypes from 'prop-types'
import { DndProvider, useDrop } from 'react-dnd'
import Backend from 'react-dnd-html5-backend'
import { ItemTypes } from './constants'
import { useDrag } from 'react-dnd'
import styles from "../css/styles.css"
function NodeLabel(props) {
  const ref = useRef(null)
  const handleNodeClick = () => {
    const { onClick, nodeId } = props
    onClick(nodeId)
  }
  const { nodeId, subNodes } = props
  let node = props.nodes.get(nodeId)
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
      node.collapsed = false
      props.setParent(nodeId, droppedNode)
    }
  })
  let bullet = ">"
  if (node.collapsed || subNodes === undefined) {
    bullet = "*";
  }
  if (nodeId !== null) {
    drag(drop(ref))
  }
  return (
    <li >
      <div ref={ref} onClick={handleNodeClick}>{bullet} {props.getNodeName(node.data)}</div>
      {subNodes}
    </li>
  )
}
class SimpleTree extends React.Component {
  constructor(props) {
    super(props);
    const { data, getNodeId } = props
    let nodes = new Map()

    // this is derived state (bad?)
    // TODO: break collapsed out to own element?
    data.forEach((originalNode) => {
      nodes.set(getNodeId(originalNode), { collapsed: false, data: originalNode })
    })
    this.state = {
      nodes: nodes,
    }
    // console.log("init nodes")
    // console.log(nodes)
    this.handleNodeClick = this.handleNodeClick.bind(this)
    this.setParent = this.setParent.bind(this)
  }

  // TODO: optimize/remove this
  static getDerivedStateFromProps(nextProps, prevState) {
    const { data, getNodeId } = nextProps
    const { nodes } = prevState

    data.forEach((newNode) => {
      let oldNode = nodes.get(getNodeId(newNode))
      if (oldNode === undefined) {
        nodes.set(getNodeId(newNode), { collapsed: false, data: newNode })
      } else {
        nodes.set(getNodeId(newNode), { collapsed: oldNode.collapsed || false, data: newNode })
      }
    })
    return { ...prevState, nodes }
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
  hasChildren(nodeId) {
    const { nodes } = this.state;
    for (let [_, value] of nodes) {
      if (value.data.parent === nodeId) {
        return true;
      }
    }
    return false;
  }
  handleNodeClick(nodeId) {
    const { nodes } = this.state
    const { nodeClicked, getNodeId } = this.props
    let node = nodes.get(nodeId)
    if (node === null) {
      return
    }
    if (node.collapsed === undefined) {
      node.collapsed = true;
    } else {
      node.collapsed = !node.collapsed
    }
    nodeClicked(getNodeId(node), node)
    this.setState({ nodes: nodes })
  }
  setParent(parentId, childId) {
    console.log("setting parent")
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
      <NodeLabel nodes={nodes} nodeId={nodeId} key={nodeId} subNodes={subNodes} onClick={this.handleNodeClick} setParent={this.setParent} getNodeName={this.props.getNodeName} />
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

SimpleTree.defaultProps = {
  getNodeId: (node) => node.id,
  getNodeName: (node) => node.name,
  getNodeParent: (node) => node.parent,
  nodeClicked: (nodeId, node) => { console.log("node clicked"); console.log(node) }
}
export default SimpleTree