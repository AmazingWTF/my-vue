## knowledge point

`将知识点分解，逐个掌握，最后在串联起来`
> 1. 依赖收集(Dep、Watcher、defineReactive)
> 2. 实现observer(对象，数组)
`劫持对象的getter/setter，触发依赖收集和执行回调，重写数组的__proto__(存在此属性)，或者直接在对象本身重写方法(不存在__proto__属性)`
> 3. 事件处理