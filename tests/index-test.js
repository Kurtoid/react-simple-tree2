import expect from 'expect'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import React from 'react'
import SimpleTree from '../src/'
import { ItemTypes } from '../src/constants'

configure({ adapter: new Adapter() })

const data = [
  { id: 1, name: "root", parent: null },
  { id: 2, name: "sub1", parent: 1, collapsed: true },
  { id: 3, name: "sub2", parent: 1 },
  { id: 4, name: "1sub1", parent: 2 },
  { id: 5, name: "1sub2", parent: 2 }
]
describe('SimpleTree', () => {
  let component
  beforeEach(() => {
    console.log("beforeeach")
    component = shallow(<SimpleTree data={data} onChange={() => { }} />)
    console.log(component)
  })
  it('finds the root node', () => {
    expect(component.instance().getRootNode()).toBe(1)
  })
  it('finds children of nodes', () => {
    expect(component.instance().getChildren(1)).toEqual([2, 3])
    expect(component.instance().getChildren(2)).toEqual([4, 5])
  })
  it('detects if a node has children', () => {
    expect(component.instance().hasChildren(1)).toBe(true)
    expect(component.instance().hasChildren(2)).toBe(true)
    expect(component.instance().hasChildren(3)).toBe(false)
    expect(component.instance().hasChildren(4)).toBe(false)
  })
})