import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import {ResponseSchemaInterceptorOptions} from "./response-schema.module";
import {RESPONSE_SCHEMA_METADATA} from "./constants";

@Injectable()
export class ResponseSchemaInterceptor implements NestInterceptor {
  constructor(
    @Inject(Reflector.name) private reflector: Reflector,
    @Inject('RESPONSE_SCHEMA_INTERCEPTOR_OPTIONS')
    private options: ResponseSchemaInterceptorOptions,
  ) {}

  getTypeAndValue(data, key): { hasKey: boolean; type: string; value: any } {
    return data.hasOwnProperty(key)
      ? {
          hasKey: true,
          type: Array.isArray(data[key]) ? 'array' : typeof data[key],
          value: data[key],
        }
      : { hasKey: false, type: null, value: null };
  }

  parseResponse(data: any, schema: any) {
    const response = {};
    for (const key of Object.keys(schema)) {
      const schemaType = Array.isArray(schema[key])
        ? 'array'
        : typeof schema[key];

      const { hasKey, type, value } = this.getTypeAndValue(data, key);

      switch (schemaType) {
        case 'array':
          if (hasKey) {
            if (schemaType === type) {
              if (typeof schema[key][0] === 'function') {
                response[key] = schema[key][0]().callback(data, key);
              } else {
                response[key] = value.map((i) =>
                    this.parseResponse(i, schema[key][0]),
                );
              }

            } else {
              if (this.options.strictTypeCheck) {
                this.options.onStrictTypeCheckFail.call(
                  this,
                  schema,
                  data,
                  key,
                );
              }
            }
          } else {
            // hasKey: false
            if (this.options.strictKeyCheck) {
              this.options.onStrictKeyCheckFail.call(this, schema, data, key);
            }
          }
          break;
        case 'object':
          if (
            schema[key].hasOwnProperty('type') &&
            schema[key].hasOwnProperty('callback')
          ) {
            response[key] = schema[key].callback(data, key);
          } else {
            if (hasKey) {
              if (schemaType === type) {
                response[key] = this.parseResponse(value, schema[key]);
              } else {
                if (this.options.strictTypeCheck) {
                  this.options.onStrictTypeCheckFail.call(
                    this,
                    schema,
                    data,
                    key,
                  );
                }
              }
            } else {
              if (this.options.strictKeyCheck) {
                this.options.onStrictKeyCheckFail.call(this, schema, data, key);
              }
            }
          }
          break;
        case 'function':
          if (data[key] !== null && data[key] !== undefined) {
            response[key] = schema[key]().callback(data, key);
          } else {
            if (this.options.strictKeyCheck) {
              this.options.onStrictKeyCheckFail.call(this, schema, data, key);
            }
          }
          break;
        default:
          break;
      }
    }

    return response;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const schema = this.reflector.getAllAndOverride<any>(
      RESPONSE_SCHEMA_METADATA,
      [context.getHandler(), context.getClass()],
    );

    return next
      .handle()
      .pipe(map((data) => (schema ? this.parseResponse(data, schema) : data)));
  }
}
