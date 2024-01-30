/**
 * 拦截xhr响应，返回自定义的response
 */

//

interface InterceptorRule {
  url: string | RegExp;
  responseType: 'json' | 'text' | 'blob' | 'arraybuffer' | 'document';
  response: Record<string, any> | string | Blob;
}

export function XHRInterceptor() {
  const originOpen = XMLHttpRequest.prototype.open;

  XMLHttpRequest.prototype.open = function () {
    originOpen.apply(this, arguments as any);
  };
}
