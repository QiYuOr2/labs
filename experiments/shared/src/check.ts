import { typeIs, typeOf } from './typeof';

type Schema<T> = {
  [K in keyof T]: Check<T[K]>;
};

const CheckErr = {
  Required: (key: string) => new Error(`非空字段 ${key} 缺少值`),
  TypeError: (currentType: string, type: string) => new Error(`期望 ${type}, 但是收到 ${currentType}`),
};

class Check<T> {
  readonly _type: string;
  private _schema: Schema<T> | null;
  private _nullable: boolean;
  private _defaultValue: T | null = null;

  constructor(type: string, schema: Schema<T> | null = null, nullable: boolean = false, defaultValue: T | null = null) {
    this._type = type;
    this._schema = schema;
    this._nullable = nullable;
    this._defaultValue = defaultValue;
  }

  static string() {
    return new Check<string>('string');
  }

  static number() {
    return new Check<number>('number');
  }

  static object<T>(schema: Schema<T>) {
    return new Check<T>('object', schema);
  }

  static array<U>(schema: Check<U>) {
    return new Check<U[]>('array', schema as any);
  }

  nullable() {
    return new Check<T | null>(this._type, this._schema, true);
  }

  default(value?: T) {
    const defaultValueByType: Record<string, any> = {
      string: '',
      number: 0,
      object: {},
      array: [],
    };

    return new Check<T>(this._type, this._schema, true, value || defaultValueByType[this._type]);
  }

  getSchema() {
    if (this._type === 'object' && this._schema) {
      const children: any = {};
      for (const key in this._schema) {
        children[key] = this._schema[key].getSchema();
      }
      return {
        type: this._type,
        nullable: this._nullable,
        children: children,
      };
    } else {
      return {
        type: this._type,
        nullable: this._nullable,
      };
    }
  }

  parse(data: any): T {
    if (this._type === 'array' && this._schema) {
      if (!Array.isArray(data)) {
        if ((typeIs.nul(data) || typeIs.undef(data)) && this._nullable) {
          if (this._defaultValue !== null) {
            data = data || this._defaultValue;
          } else {
            return data as T;
          }
        } else {
          throw CheckErr.TypeError(typeOf(data), this._type);
        }
      }
      return data.map((item: any) => (this._schema as any)!.parse(item)) as T;
    }

    if (this._type === 'object' && this._schema) {
      if (this._nullable) {
        data = data || this._defaultValue || {};
      }
      const result: any = {};
      for (const key in this._schema) {
        if (data[key] === undefined || data[key] === null) {
          if (this._schema[key]._defaultValue !== null) {
            result[key] = this._schema[key]._defaultValue;
          } else if (this._schema[key]._nullable) {
            result[key] = this._schema[key].parse(null);
          } else {
            throw CheckErr.Required(key);
          }
        } else {
          result[key] = this._schema[key].parse(data[key]);
        }
      }
      return result as T;
    }

    if (data === null || data === undefined) {
      if (this._defaultValue !== null) {
        return this._defaultValue;
      } else if (this._nullable) {
        return null as T;
      } else {
        throw CheckErr.TypeError(typeOf(data), this._type);
      }
    } else if (typeOf(data) !== this._type) {
      throw CheckErr.TypeError(typeOf(data), this._type);
    }

    return data as T;
  }
}

export type infer<T> = T extends Check<infer U> ? U : never;

export const string = Check.string;
export const number = Check.number;
export const object = Check.object;
export const array = Check.array;
