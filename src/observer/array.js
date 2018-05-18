import { 
  def,
  indexOf
 } from '../util/index'

 const arrayProto = Array.prototype
 export const arrayMethods = Object.create(arrayProto)

 ;[
   'push',
   'pop',
   'shift',
   'unshift',
   'splice',
   'sort',
   'reverse'
 ]
 .forEach(method => {
   const original = arrayProto[method]
   def(arrayMethods, method, function mutator () {
     let i = arguments.length
     let args = new Array(i)
     while (i--) {
       args[i] = arguments[i]
     }
     const result = original.apply(this, args)
     const ob = this.__ob__
     let inserted
     switch (method) {
       case 'push':
       case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
     }
     if (inserted) ob.observeArray(inserted)
     ob.dep.notify()
     return result
   })
 })


 def(
   arrayProto,
   '$set',
   function $set (index, val) {
     if (index >= this.length) {
       this.length = Number(index) + 1
     }
     return this.splice(index, 1, val)[0]
   }
 )

 def(
   arrayProto,
   '$remove',
   function $remove (item) {
     if (!this.length) return
     const index = indexOf(this, item)
     if (index > -1) {
       return this.splice(index, 1)
     }
   }
 )