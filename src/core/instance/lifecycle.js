import Watcher from '../observer/watcher'
import { emptyVNode } from '../vdom/vnode'
import { observerState } from '../observer/index'
import {
  warn,
  validateProp,
  remove,
  noop
} from '../util/index'
import { resolveSlots } from './render'

