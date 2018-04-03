## RESOURCES 
current commit by Evan You: https://github.com/vuejs/vue/commits/v1.0.20?after=b12e21cb36522f8defab82de3111502a8b97083f+1786
git commit version: 30f67ab14090900a28c18db01cf631c037d36e81

## BRIF
#### observer
>new Observer() 过程中发生的变化

```text
> 继承自 Emitter, 挂载 on once off emit 等方法
> 初始化 observer, 挂载 value type initiated adaptors $observer 属性
> 执行 util 中的 define 方法，添加 $observer 属性
  
```