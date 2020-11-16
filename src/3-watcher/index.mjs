import { defineReactive } from './defineReactive.mjs'
import { Watcher } from './Watcher.mjs'

const obj = {}
defineReactive(obj, 'test', 'test')
const watcher1 = new Watcher(obj, 'test', function (newVal, oldVal) {
  console.log(`obj.test 更新 ${oldVal} => ${newVal}`)
})
const watcher2 = new Watcher(obj, 'test', function (newVal, oldVal) {
  console.log(`obj.test watcher2 提示 ${oldVal} => ${newVal}`)
})

obj.test = 'changed'
