import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import {RESPONSE_SCHEMA_METADATA} from "./constants";

export const StringValue = (callback?) => {
  if (callback) {
    return { callback, type: 'string' };
  } else {
    return { callback: (value, key) => value[key], type: 'string' };
  }
};
export const NumberValue = (callback?) => {
  if (callback) {
    return { callback, type: 'number' };
  } else {
    return { callback: (value, key) => value[key], type: 'number' };
  }
};
export const BooleanValue = (callback?) => {
  if (callback) {
    return { callback, type: 'boolean' };
  } else {
    return { callback: (value, key) => value[key], type: 'boolean' };
  }
};

const getType = (val) => {
  return Array.isArray(val) ? 'array' : typeof val;
};

const parseSchema = (schema) => {
  const response = {};
  for (const key of Object.keys(schema)) {
    const type = getType(schema[key]);
    response[key] = {
      type: type,
    };

    switch (type) {
      case 'array':
        response[key]['items'] = {
          type: 'object',
          properties: {
            ...parseSchema(schema[key][0]),
          },
        };
        break;
      case 'object':
        if (
          schema[key].hasOwnProperty('type') &&
          schema[key].hasOwnProperty('callback')
        ) {
          response[key] = { type: schema[key]['type'] };
        } else {
          response[key]['properties'] = parseSchema(schema[key]);
        }
        break;
      case 'function':
        const result = schema[key]();
        response[key] = { type: result.type };
        break;
      default:
        break;
    }
  }

  return response;
};

export function ResponseSchema(schema: object, status = 200) {
  const parsedSchema = parseSchema(schema);

  return applyDecorators(
    SetMetadata(RESPONSE_SCHEMA_METADATA, schema),
    ApiResponse({
      status,
      schema: {
        allOf: [
          {
            properties: {
              ...parsedSchema,
            },
          },
        ],
      },
    }),
  );
}
