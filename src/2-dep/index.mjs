import { Dep } from './dep.mjs'
import { defineReactive } from './defineProperty.mjs'

const obj = {}

// 将属性转化为可依赖收集
defineReactive(obj, 'test', 'hahh')

// 当前收集依赖的属性，需要执行的操作
Dep.target = (newVal, oldVal) => {
  console.log(`obj.test had changed ${oldVal} => ${newVal}`)
}

// 执行依赖收集
obj.test

// 触发变更
obj.test = 'changed'
