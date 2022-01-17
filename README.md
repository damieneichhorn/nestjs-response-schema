# nestjs-response-schema
A package for declaring and enforcing responses in NestJS

## Installing
First, start by installing nestjs-response-schema by running the following command:
```shell
npm i nestjs-response-schema
```

After installing the package, include the module in your app module and register it using the register method. (This loads the module globally)
```javascript
import { ResponseSchemaModule } from 'nestjs-response-schema';

@Module({
  imports: [
    ResponseSchemaModule.setup({
      // options here
    }),
  ],
})
export class AppModule {}

```

## Options
Currently the following options are supported
 - strictKeyCheck: boolean
 - strictTypeCheck: boolean
 - onStrictKeyCheckFail: function
 - onStrictTypeCheckFail: function

### strictKeyCheck
This option allows you to enable/disable the strict key check. This checks the keys from received data against the keys from the schema. When a key that is in the schema, is missing from the data, it will throw an InternalServerException. This behavior is overridable by the onStrictKeyCheckFail option.

### strictTypeCheck
This option allows you to enable/disable the strict type check. This checks the types from received data values against the types from the schema. When the data value type doesn't match the schema type, it will throw an InternalServerException. This behavior is overridable by the onStrictTypeCheckFail option.

### onStrictKeyCheckFail
This option allows you to override what happens when a strict key check fails. This function receives the currently evaluated schema, data and the key that is evaluated as arguments.

### onStrictTypeCheckFail
This option allows you to override what happens when a strict type check fails. This function receives the currently evaluated schema, data and the key that is evaluated as arguments.

## How to use
To start using the response schema's after installing, start by annotating a controller method with the `@ResponseSchema(schema, statusCode)` decorator. This decorator takes a schema as the argument and an optional statusCode.

Schema's are made as objects and are constructed with key value pairs, the keys being the name of the property, and the values being the expected types.
This package makes use of it's own type to handle the underlying logic. Currently the following types are supported:
- StringValue
- NumberValue
- BooleanValue
- Object
- Array

### StringValue
A StringValue represents a basic string.

#### Schema
```javascript
import { StringValue } from 'nestjs-response-schema';

const schema = {
  name: StringValue
}
```

#### Data
```javascript
const data = {
  name: 'test',
  hidden: 'hello',
}
```

#### Output
```json
{
  "name": "test"
}
```
A StringValue can also be used with a function attached, allowing you to transform or aggregate data. The function received the data object with the containing key as an argument
#### Schema
```javascript
import { StringValue } from 'nestjs-response-schema';

const schema = {
  test: StringValue((data) => data.nested.name.substr(1,2))
}
```

#### Data
```javascript
const data = {
  name: 'test',
  hidden: 'hello',
  nested: {
    name: 'hello'
  }
}
```

#### Output
```json
{
  "test": "el"
}
```

### NumberValue
A NumberValue represents a basic numerical value

#### Schema
```javascript
import { NumberValue } from 'nestjs-response-schema';

const schema = {
  id: NumberValue
}
```

#### Data
```javascript
const data = {
  id: 12,
  hidden: 'hello',
}
```

#### Output
```json
{
  "id": 12
}
```
A NumberValue can also be used with a function attached, allowing you to transform or aggregate data. The function received the data object with the containing key as an argument
#### Schema
```javascript
import { NumberValue } from 'nestjs-response-schema';

const schema = {
  id: NumberValue((data) => (data.nested.code + 1))
}
```

#### Data
```javascript
const data = {
  id: 12,
  hidden: 'hello',
  nested: {
    code: 1234,
  }
}
```

#### Output
```json
{
  "id": 1235
}
```

### BooleanValue
A BooleanValue represents a basic boolean value

#### Schema
```javascript
import { BooleanValue } from 'nestjs-response-schema';

const schema = {
  exposed: BooleanValue
}
```

#### Data
```javascript
const data = {
  exposed: true,
  hidden: 'hello',
}
```

#### Output
```json
{
  "exposed": true
}
```
A BooleanValue can also be used with a function attached, allowing you to transform or aggregate data. The function received the data object with the containing key as an argument
#### Schema
```javascript
import { BooleanValue } from 'nestjs-response-schema';

const schema = {
  cool: BooleanValue((data) => data.nested.isCool)
}
```

#### Data
```javascript
const data = {
  exposed: true,
  hidden: 'hello',
  nested: {
    isCool: true
  }
}
```

#### Output
```json
{
  "cool": true
}
```


### Object
nestjs-response-schema has supported for nested schema's and data and will automatically pick it up when it is used.

#### Schema
```javascript
import { StringValue } from 'nestjs-response-schema';

const schema = {
  content: {
    name: StringValue
  }
}
```
#### Data
```javascript
const data = {
  title: 'Hello World',
  content: {
    name: 'NestJS'
  }
}
```
#### Output
```json
{
  "content": {
    "name": "NestJS"
  }
}
```
### Array
nestjs-response-schema also has support for arrays and defining the schema for array items.
To define an array schema, just create an array with 1 item, and have that item just like any other schema object. It will force this schema upon any item in the data array


#### Schema
```javascript
import { StringValue } from 'nestjs-response-schema';

const schema = {
  items: [
    { name: StringValue }
  ]
}
```
#### Data
```javascript
const data = {
  items: [
    { name: 'test 1', hidden: 'hello' },
    { name: 'test 2', hidden: 'hello2' },
  ]
}
```
#### Output

```json
{
  "items": [
    {
      "name": "test1"
    },
    {
      "name": "test 2"
    }
  ]
}
```

## NestJS/Swagger
This package will also set the @ApiResponse on the affected method with the right schema.
It will by default set the response status to 200 unless specified 

`@ResponseSchema({})` will automatically make a Swagger Response with a 200 statusCode

Post requests in NestJS usually response with a 201 statusCode and thereof we need to response with a 201
`@ResponseSchema({}, 201)`

## Examples
