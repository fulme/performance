# 前端性能收集器
目前收集指标如下，后续酌情新增
```js
  const INDICATORS = {
    // DNS查询耗时
    dns: '',
    
    // TCP连接耗时
    tcp: '',
    
    // TTFB(首字节时间)
    ttfb: '',
    
    // 白屏时间
    firstPaintTime: '',
    
    // DOMContentLoaded耗时
    domReady: '',
    
    // 页面加载完成耗时
    load: '',
  };
```

#  安装
```shell
  npm i performance-collector --save
```

# 使用
```js
  import getPerformance from 'performance-collector';

  getPerformance((indicators) => {
    console.log(indicators);
  });
```

# 兼容性
实现中使用了`addEventListener`，所以不兼容`IE8-`（不会回调）。
性能参数主要通过`performance.timing`接口计算而来，不支持此接口的浏览器只会计算`load`和`domReady`两个指标，其他指标为空。