## RESOURCES 
current commit by Evan You: https://github.com/vuejs/vue/commits/v1.0.20?before=b12e21cb36522f8defab82de3111502a8b97083f+1787
git commit version: e9ecdfe1c0f695396ce790f9637787239d180804

## INTRO
#### observer
    继承自 Emitter(on, once, off, emmit, applyEmit)
    根据传递的数据类型将数据的原型对象(__proto__)属性改写（数组里面是改写原生方法，然后将发生的变化提交到mutation事件处理, 对象中则是使用convert方法将普通对象转化为getter/setter对象，在get和set事件中触发相应事件）
    on、once 等方法在当前observer对象中添加 _cbs 属性(Array)，存储注册的监听事件；emit事件则是遍历执行对应事件的所有注册事件

#### event
    core/instance/evnets.js
    事件处理函数initEvent -> vdom/helpers  updataListeners函数 处理新旧监听事件
    (ps: capture标识暂未发现用途)

#### compiler
    compiler/index.js





## 知识点记录
- next内部实现机制:
  > 利用原生Promise或者MutationObserver来实现，但是MutationObserver在IOS>=9.3.3上利用touch事件触发几次之后会完全停止工作，所以如果原生Promise可用，优先使用Promise.then，再不行的话，就使用setTimeout

