import {
  extend,
  isArray
} from '../util/lang'


function guardComponents (options) {
  // 有子组件
  if (options.components) {
    let components =
      options.components = 
      guardArrayAssets(options.components),
      ids = Object.keys(components),
      def
      // 字面意思为组件的映射
      let map = options._componentNameMap = {}
      
  }
}

function guardArrayAssets (assets) {
  if (isArray(assets)) {
    let res = {},
      i = assets.length,
      asset
    while (i--) {
      asset = assets[i]

    }
  }
}


export function mergeOptions (parent, child, vm) {
  guardComponents(child)
  guardProps(child)
}