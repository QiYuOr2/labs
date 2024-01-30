interface RulesRecord {
  url: string;
  method?: string;
  contains?: boolean;
  response: unknown;
}

export class Rules {
  #records: RulesRecord[] = [];

  getRules(url: string) {
    const result = this.#records.filter((record) => {
      if (record.contains) {
        return url.includes(record.url);
      }
      return record.url === url;
    });

    if (result.length) {
      return result[0];
    }
    return null;
  }

  setRules(item: RulesRecord) {
    const record = this.getRules(item.url);
    if (record) {
    }
  }

  match(url: string, method: string) {
    console.log('match', url, method);
    return;
  }
}

export function proxyXHR(global: typeof globalThis, rules: Rules) {
  const OriginXHR = global.XMLHttpRequest;

  global.XMLHttpRequest = class extends OriginXHR {
    #rules: Rules;
    #url!: string;
    #method!: string;

    constructor() {
      super();
      this.#rules = rules;
    }

    get response() {
      return this.#rules.match(this.#url, this.#method) || super.response;
    }

    get responseText() {
      return this.#rules.match(this.#url, this.#method) || super.responseText;
    }

    open(method: string, url: string, ...rest: any[]): void {
      this.#method = method;
      this.#url = url;

      if (/^(https?:\/\/)|(\/\/)/.test(url)) {
        this.#url = url;
      } else {
        this.#url = `${location.origin}/${url.replace(/^\//, '')}`;
      }

      // @ts-ignore
      return super.open(method, url, ...rest);
    }
  };
}
