import { InternalServerErrorException, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import {ResponseSchemaInterceptor} from "./response-schema.interceptor";

export interface ResponseSchemaInterceptorOptions {
  strictKeyCheck?: boolean;
  onStrictKeyCheckFail?: (schema: any, data: any, key: string) => any;
  strictTypeCheck?: boolean;
  onStrictTypeCheckFail?: (schema: any, data: any, key: string) => any;
}

@Module({})
export class ResponseSchemaModule {
  static setup(options: ResponseSchemaInterceptorOptions) {
    const defaultOptions: ResponseSchemaInterceptorOptions = {
      strictKeyCheck: false,
      strictTypeCheck: false,
      onStrictKeyCheckFail: () => {
        throw new InternalServerErrorException('strict key check failed');
      },
      onStrictTypeCheckFail: () => {
        throw new InternalServerErrorException('strict type check failed');
      },
    };

    return {
      module: ResponseSchemaModule,
      global: true,
      imports: [],
      providers: [
        {
          provide: 'RESPONSE_SCHEMA_INTERCEPTOR_OPTIONS',
          useValue: { ...defaultOptions, ...options },
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: ResponseSchemaInterceptor,
        },
      ],
      exports: ['RESPONSE_SCHEMA_INTERCEPTOR_OPTIONS'],
    };
  }
}
