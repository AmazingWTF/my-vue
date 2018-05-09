/**
 * 将target的属性对象中的成员代理到target上面
 * 
 * @param {Obejct} target - 目标对象
 * @param {String} sourceKey - 来源目标的键名
 * @param {String} key - 目标方法的键名
 */

export default function proxy (target, src) {
  for (let k in src) {
    Object.defineProperty(target, k, {
      enumerable: true,
      configurable: true,
      get () {
        return src[k]
      },
      set (newVal) {
        src[k] = newVal
      }
    })
  }
}