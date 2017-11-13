/**
 * @fileOverview 用于收集性能参数（兼容IE9+）
 */

const START = Date.now();
const CALLBACKS = [];
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

function calcIndicators(cb) {
  // support for IE9+, firefox3.5+, chrome25+, safari5+, opera15+
  // @sea https://caniuse.com/#search=performance
  const performance = window.performance
    || window.webkitPerformance
    || window.msPerformance
    || window.mozPerformance
    || window.oPerformance;

  // @sea https://developer.mozilla.org/en-US/docs/Web/API/PerformanceTiming
  const timing = performance && performance.timing;
  if (timing) {
    const navigationStart = timing.navigationStart;
    const firstPaint = timing.msFirstPaint || timing.mozFirstPaintTime;
    const loadEventEnd = timing.loadEventEnd || Date.now();

    if (firstPaint === 0) {
      // TODO nothing, IE9 bug
      // @sea https://msdn.microsoft.com/zh-cn/ff974719
    } else if (firstPaint > 0) {
      INDICATORS.firstPaintTime = firstPaint - navigationStart;
    } else {
      // for chrome only
      const loadTimes = window.chrome && window.chrome.loadTimes && window.chrome.loadTimes();
      if (loadTimes) {
        INDICATORS.firstPaintTime = (1e3 * loadTimes.firstPaintTime) - navigationStart;
      }
    }

    INDICATORS.dns = timing.domainLookupEnd - timing.domainLookupStart;
    INDICATORS.tcp = timing.connectEnd - timing.connectStart;
    INDICATORS.ttfb = timing.responseStart - timing.requestStart;
    INDICATORS.domReady = timing.domContentLoadedEventEnd - navigationStart;
    INDICATORS.load = loadEventEnd - navigationStart;
  }

  cb(INDICATORS);
}

(() => {
  if (!window.addEventListener) {
    // TODO support IE8-
    return;
  }

  let timer = null;
  const TIMEOUT = 1e4;

  const doCallback = (indicators) => {
    for (let i = 0; i < CALLBACKS.length; i += 1) {
      CALLBACKS[i](indicators);
    }
  };

  const onload = () => {
    INDICATORS.load = Date.now() - START;
    clearTimeout(timer);
    calcIndicators(doCallback);
  };

  timer = setTimeout(() => {
    INDICATORS.load = TIMEOUT;
    window.removeEventListener('load', onload);
    calcIndicators(doCallback);
  }, TIMEOUT);

  window.addEventListener('DOMContentLoaded', () => {
    INDICATORS.domReady = Date.now() - START;
  }, false);

  window.addEventListener('load', onload, false);
})();

export default function(cb) {
  if (INDICATORS.load > 0) {
    cb(INDICATORS);
  } else {
    CALLBACKS.push(cb);
  }
}