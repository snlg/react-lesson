<p align="center"><img src="http://oy0oxkhrp.bkt.clouddn.com/dc3d635e297ba9fa865773dcab6eea7aca7f274f494f7-4X1cdW_fw658.png" alt="Hulai" width="50%"></p>

> **`首先感谢珠峰培训张仁阳老师提供的学习机会。预祝珠峰培训越办越好`**

**目录**

- **入口分析**  
- **思想和架构**
- **JSX编译**
- **组件创建**
- **组件渲染**

----------
## 入口分析
一张图简而代过
![](http://oy0oxkhrp.bkt.clouddn.com/React%20%E6%A8%A1%E5%9D%97%E5%88%86%E6%9E%90%20%281%29.png)

## 思想和架构
- `react`为什么诞生，为了解决什么问题?
- 除了你所熟知的`dom-diff`,`virtual dom`等概念之外，思考过react还有其他什么创新么? 
- 猜想一下，`react`内部如何工作。
### 设计思路
在`mvvm`框架没有流行之前，前端使用`jquery`和`template`的时候，每次数据变化，仍然需要操作`template`全量渲染(更新模板`innerHTML`)，即使`teaplate`拆的很细，仍然保证不了有没有变化的`dom`渲染。缺点也很明显，操作`dom`非常繁琐，而且在大量修改`dom`节点性能低下。
`react`的灵感来自游戏，当数据变化时，界面仅仅更新变化的一部分形成新的一帧渲染。这是之前框架无法做到的，react处理构建用户界面通过将他们分解为虚拟组件，虚拟组件是react的核心，整个`react`框架的设计理念，都是围绕虚拟组件进
行的。
### 组件
- `ReactTextComponent`: `react`  在文字外层都会包裹一层，用来设置id 用来触发diff算法。
- `ReactNativeComponent`: `div`和`span`都是原生组件。`react`的主要算法(如`mount`、`dom-diff`)都是在这里实现。用来`dom-diff`的在渲染阶段会直接设置在原生组件标签上。(`markup`拼接的时候插入`id`)
- `ReactCompositeComponent`: 其实复合组件是最常用的，最终渲染成`ReactNativeComponent`。复合组件通常以大写开头。
```javascript
<Form> <Form.Item>
用户名:
<input placeholder="请输入用户名" /> </Form.Item>
</Form>
```
如上代码的数据结构可以表现为:
```
{
"component": Form<ReactCompositeComponent>, 
	"children": [{
	"component": Form.Item<ReactCompositeComponent>,
		"children": [{
		"component": span<ReactNativeComponent>,
			"children": string<String> }, 
			{
				"component": input<ReactNativeComponent>, 
				"props": { placeholder: string<String> 
			}, 
				"children": []
		}] 
	}]
}
```
### diff
从原先的`O(n3)`变成了现在的`O(n)`。
```htmlbars
<div> 
	<h1>h1</h1>
	<h2>h2</h2> 
	<h3>h3</h3>
</div>
```
变成
```htmlbars
<div>
	<h2>h2</h2> 
	<p>p</p> 
	<h3>new h3</h3> 
	<h1>h1</h1>
</div>
```
`react`是如何做到的呢?
最外层的div标签一致，然后对比`div`的`children`。 
- 循环第一个新节点h2和老节点h1，发现节点类型不同，删除掉h1，插入h2。 
- 同理，p不等于h2，删除h2，插入p。
- 继续，h3等于h3，更新h3的内容new h3。 
- 最后，发现之前没有h1，插入h1。
### 层次
#### 展示层
用户声明、创建虚拟组件以及渲染虚拟组件。
#### Virtual组件层
`react`的绝大多数代码，包括虚拟组件的创建、渲染和更新流程`dom-diff`。
#### 基础功能
所有公共代码，提供底层功能。
![](http://oy0oxkhrp.bkt.clouddn.com/WechatIMG11.jpeg)
- `ReactMount`: 顾名思义，负责`react`组件的渲染
- `ReactDOM`: 用来创建`native`组件
- `ReactComponent`: `react`虚拟组件
- `ReactOwner\ReactCurrentOwner`: 父子组件指针 `ReactDOMIDOperations`: 真实的`dom`操作
- `ReactMuticalChildren`: `dom-diff`的实现 功能层(黄色部分):为`react`业务提供基础功能。
### 模块调用关系以及流程图
![](http://oy0oxkhrp.bkt.clouddn.com/WX20180728-141257@2x.png)
- 配置声明:用户代码
- 组件实例化:`ReactComponsiteComponent.createClass`
- 组件渲染:`ReactMount.renderComponent`
- 处理事件回调:`renderComponent->ReactMount.prepareTopLevelEvents`
- 挂载事件:`ReactNativeComponent._updateDOMProperties->ReactEvent.putListener `
- 界面更新:`ReactComposite.setState | ReactComponsite.receiveProps`
-  dom-diff: `receiveProps -> ReactMutiChild.updateMultiChild`
- 组件渲染或更新:`ReactDOMIDOperations->DOMChildrenOperations`

## JSX编译
先来看一个简单的例子:
```javascript
var ExampleApplication = React.createClass({
	let test = 1
	render: function() {
	   return <p>hello world</p>;
	}
});
React.renderComponent(
   <ExampleApplication elapsed={new Date().getTime()} />,
   document.getElementById('container')
);
```
上述`demo`中`js`文件里面写了`html`标签，不经过编译的话在词法解析的时候就会报错。
介绍下各个版本编译的区别。
![](http://oy0oxkhrp.bkt.clouddn.com/20180729002525.png)
- 在`react-15`里，使用`babel-preset-react`来编译`jsx`，这个`preset`又包含了4个插件，其中`transform-react-jsx`负责编译`jsx`，调 用了`React.createElement`函数生成虚拟组件。
- `react-0.3`版本通过`JSXTransformer`编译之后得到:
```javascript

<p>hello world</p>
// 编译成 -> 
React.DOM.p(null,'hello world')

<ExampleApplication elapsed={new Date().getTime()} />
// 编译成 -> 
ExampleApplication( {elapsed:new Date().getTime()}, null )
```
我们通过`Object.getPrototypeOf`分别打印出来两个对象的原型对象
![enter image description here](http://oy0oxkhrp.bkt.clouddn.com/20180729003558.png)
可以看出`JSX`编译之后
- 复合组件，继承`ReactCompositeComponentBase`的原型对象。
- 原生组件，继承`ReactNativeComponent`的原型对象。
上述`renderComponent`，负责将`components`实例渲染到给定的`container`中。渲染之前会先判断`components`和当前的`containers`是否已经存在过关联关系。
若找到关联关系，则会执行更新流程，使用`component`的属性更新找到的`react`组件实例。
若没有找到，则会先创建关联关系，然后调用`mountComonentIntoNode`，将`component`挂载到`container`上。
![renderComponent渲染前置判断](http://oy0oxkhrp.bkt.clouddn.com/WX20180724-110629@2x.png)

## 组件创建
![enter image description here](http://oy0oxkhrp.bkt.clouddn.com/20180729004410.png)
组件创建流程并不复杂，消费者需要调用`createClass`，把配置的回调函数(包含初始化、属性、状态、生命周期钩子、渲染、自 定义函数等，以下统称`spec`)传入即可。
声明阶段`spec`中的渲染函数(`render`)不能为空，`react`组件需要根据`render`的返回值来渲染最终的页面元素。
通过学习总结`createClass`内的关系，如下图：![enter image description here](http://oy0oxkhrp.bkt.clouddn.com/creactClass%E5%87%BD%E6%95%B0%E5%8E%9F%E5%9E%8B%E5%85%B3%E7%B3%BB%E5%88%86%E6%9E%90.png)

## 组件渲染
组件渲染的流程相对比较麻烦。流程如下:
![enter image description here](http://oy0oxkhrp.bkt.clouddn.com/20180729004816.png)
我们一步步来看，首先`renderComponent`中调用的时候生成了一个`reactRootID`，这个和容器上的属性id没有关系，是`react`给组件的一个特殊ID，然后我们将`reactRootID`和要渲染的`container`传入`mountComponentIntoNode`函数。

从`mountComponentIntoNode`中我们能看到开启了一个`transaction`事务，`transaction`保证渲染阶段不会有任何事件触发，并阻断的 `componentDidMount`事件，待执行后执行等，`transaction`在功能一章我们会详细讲解，这里不细讨论。

在确保事务开启之后执行`_mountComponentIntoNode`函数，并且调用`mountComponent`获得要渲染的`innerHTML`，最后将插入节点中，完成渲染。
```javascript
_mountComponentIntoNode: function(rootID, container, transaction) {
      var renderStart = Date.now();
      // 调用ReactCompositeComponent.js
      var markup = this.mountComponent(rootID, transaction);
      ReactMount.totalInstantiationTime += (Date.now() - renderStart);
      var injectionStart = Date.now();
      // Asynchronously inject markup by ensuring that the container is not in
      // the document when settings its `innerHTML`.
      // 每次更新container时，先从document删除掉，然后插入innerHTML，然后再插入到next节点的前面。
      var parent = container.parentNode;
      if (parent) {
        var next = container.nextSibling;
        parent.removeChild(container);
        container.innerHTML = markup;
        if (next) {
          parent.insertBefore(container, next);
        } else {
          parent.appendChild(container);
        }
      } else {
        container.innerHTML = markup;
      }
      ReactMount.totalInjectionTime += (Date.now() - injectionStart);
    }
```
![enter image description here](http://oy0oxkhrp.bkt.clouddn.com/20180729010243.png)
上面代码部分，插入节点比较好理解一点。最关键的`mountComponent`方法，如何获取`innerHTML`我们来看一下。

**ReactCompositeComponent.mountComponent**
注意这里的类变成了`ReactCompositeComponent`，源码中调用`this.monutComponent`，为什么不是调用
`ReactComponent.mountComponent`呢?这里使用了多重继承机制`mixin`。
![enter image description here](http://oy0oxkhrp.bkt.clouddn.com/20180729011257.png)
这里组件的生命周期状态是通过
- 组件生命周期：`_lifeCycleState`(`MOUNTED`与`UNMOUNTED`)用来校验`react`组件的在执行函数时状态值是否正确。
- 复合组件生命周期:`_compositeLifeCycleState`，用来保证`setState`流程不受其他行为影响。
`_lifeCycleState`只是在相应的阶段触发时候用来做校验使用，而且只是给出报错提示。
`_compositeLifeCycleState`则会在`setState`中使用。`setState`会调用`replaceState`，然后调用`_receivePropsAndState`来更新界面。 如果组件正处在`mounting`的过程或者接收到`props`的过程中，那么就将`state`缓存在`_pendingState`中，并不会更新界面的值。 下次再来理解`setState`的机制。

![enter image description here](http://oy0oxkhrp.bkt.clouddn.com/%E5%9B%BE%E7%89%87.png)


组件最终会在`_renderValidatedComponent`方法中调用`this.render`来触发。并返回`ReactComponsiteComponent`或者`ReactNativeComponent`。得到两种组件之后分别执行对应的mountComponent，当调用`ReactComponsiteComponent`.`mountComponent`会继续递归以上过程，直到找到原生组件为止。最终调用`ReactNativeComponent.mountComponent`,代码如下:
```javascript
/**
   * Generates root tag markup then recurses. This method has side effects and
   * is not idempotent.
   *
   * @internal
   * @param {string} rootID The root DOM ID for this node.
   * @param {ReactReconcileTransaction} transaction
   * @return {string} The computed markup.
   */
  mountComponent: function(rootID, transaction) {
    ReactComponent.Mixin.mountComponent.call(this, rootID, transaction);
    assertValidProps(this.props);
    return (
      this._createOpenTagMarkup() +
      this._createContentMarkup(transaction) +
      this._tagClose
    );
  },
```
`createOpenTagMarkup`生成带`reactID`的起始标签，`_createContentMarkup`生成组件内容，`_tagClose`创建组件的闭合标签。至此，`mountComponent`已经完成了。

第一期学习到此为止。3天内全部重新回顾一遍。
