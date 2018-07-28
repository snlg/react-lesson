import * as dom from './dom'
import { isString, isObject } from './utils'

const user = { name: 'test' }
const componentType = {
  ReactTextComponent:'ReactTextComponent',
  ReactCompositeComponent: 'ReactCompositeComponent',
  ReactNativeComponent: 'ReactNativeComponent'
}

const egDom = () => {
  return <div>
    1<b><c>2</c><d>{user.name}</d></b>
  </div>
}

const createElement = (tagName, attr, ...invokes) => {
  let formatTree = {}
  formatTree.children = []
  if (isString(tagName)) {
    formatTree.type = tagName
    formatTree.componentType = componentType.ReactNativeComponent
    for (let needle of invokes) {
      if (isString(needle)) {
        formatTree.value = needle
      }
      formatTree.children.push(needle)
    }
  }
  if (isObject(tagName)) {
    formatTree.children.push(tagName)
    formatTree.componentType = componentType.ReactCompositeComponent
  }
  if (attr) {
    formatTree.attr = attr
  }
  return formatTree
}
let resultData = egDom()

/** 题目: 实现一个数据结构，把jsx编译后的结构以嵌套形式保存在数据结构对象中（参考react渲染）。
 *  个人理解：
 *  1) jsx通过babel编译后的createElement的第一个入参会有2种结果
 *      1: String，对应ReactNativeComponent组件
 *      2: Object，对应ReactCompositeComponent组件
 *  
 *  2) 第三个参数为String的时候对应ReactTextComponent组件。
 *      
 *  So: 数据格式如下:
 *  {
      "children": [
        {
          "children": [{
            "children":["1"],
            "components":"a",
            "type":"ReactNativeComponent"
          }],
          "component": "can not get name",
          "type": "ReactCompositeComponent"
        },
        {
          "children": ["2",{
            "children":["3"],
            "components":"c",
            "type":"ReactNativeComponent"
          }],
          "component":"div",
          "type":"ReactNativeComponent"
        }
      ],
      "component": "div",
      "type": "ReactNativeComponent"
    }
 */

/**题目：实现render，解析这个嵌套对象，并且把解析结果渲染到页面上。
 *  实现方式如下：
/** Mapping from reactRoot DOM ID to React component instance. */
let instanceByReactRootID = {};
let globalMountPointCounter = 0;
let ReactInstanceHandles = {
  getReactRootID: (mountPointCount) => {
    return '.reactRoot[' + mountPointCount + ']';
  }
}
/** Mapping from reactRoot DOM ID to `container` nodes. */
let containersByReactRootID = {};

const getReactRootID = (container) => {
  return container.firstChild && container.firstChild.id;
}
const getReactRootIDFromNodeID = (id) => {
  var regexResult = /\.reactRoot\[[^\]]+\]/.exec(id);
  return regexResult && regexResult[0];
}

const registerContainer = (container) => {
  var reactRootID = getReactRootID(container);
  if (reactRootID) {
    // If one exists, make sure it is a valid "reactRoot" ID.
    reactRootID = getReactRootIDFromNodeID(reactRootID);
  } else {
    // No valid "reactRoot" ID found, create one.
    reactRootID = ReactInstanceHandles.getReactRootID(
      globalMountPointCounter++
    );
  }
  containersByReactRootID[reactRootID] = container;
  return reactRootID;
}

const renderDom = (domJson) => {
  let warpDom = dom.createElement(domJson)
  if (domJson.children.length === 0) {
    return warpDom
  } else {
    for (let i = 0; i < domJson.children.length; i++) {
      if (domJson.children.length === 1 && isString(domJson.children[0])) {
        let textnode = document.createTextNode(domJson.children[0])
        warpDom.appendChild(textnode)
        return warpDom
      }
      if (isString(domJson.children[i])) {
        let textnode = document.createTextNode(domJson.children[i])
        warpDom.appendChild(textnode)
      } else {
        let oldDom = renderDom(domJson.children[i])
        warpDom.appendChild(oldDom)
      }
    }
  }
  return warpDom
}
const renderComponent = (nextComponent, container) => {
  // var prevComponent = instanceByReactRootID[getReactRootID(container)];
  let reactRootID = registerContainer(container);
  instanceByReactRootID[reactRootID] = nextComponent;
  // let  markup = mountComponent(rootID);
  let markup = renderDom(resultData)
  let parent = container.parentNode;
  if (parent) {
    let next = container.nextSibling;
    parent.removeChild(container);
    container = markup;
    if (next) {
      parent.insertBefore(container, next);
    } else {
      parent.appendChild(container);
    }
  } else {
    container = markup;
  }
  return nextComponent;
}
renderComponent(resultData, document.getElementById('root'))