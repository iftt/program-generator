# program-generator [![travis][travis-image]][travis-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

[travis-image]: https://travis-ci.org/iftt/program-generator.svg?branch=master
[travis-url]: https://travis-ci.org/iftt/program-generator
[npm-image]: https://img.shields.io/npm/v/@iftt/program-generator.svg
[npm-url]: https://npmjs.org/package/@iftt/program-generator
[downloads-image]: https://img.shields.io/npm/dm/@iftt/program-generator.svg
[downloads-url]: https://www.npmjs.com/package/@iftt/program-generator

## About
The program generator module takes a specified instruction set and handles managing all new MaM data coming into the stream. If a new message triggers the the "program", it posts an `action`.

## Install
```sh
# npm
npm install --save @iftt/program-generator

# yarn
yarn add @iftt/program-generator
```

## How to Use
**NOTE**: This module assumes the MaM module `@iftt/mam` has already been instantiated with a provider and ready to request/post messages from/to said provider.

```js
// ES6
import ProgramGenerator from '@iftt/program-generator'
// ES5
const ProgramGenerator = require('@iftt/program-generator').default

// grab the instruction set:
const weatherProgram = require('./test/weatherProgram.json')

const programGenerator = new ProgramGenerator(weatherProgram) // using the default 5 second delay

programGenerator.on('action', action => {
  // do stuff
})
```


## Debug
If you need to debug this module use the string `program-generator`
```sh
DEBUG=program-generator node x
```

## API

### Type Service
```js
type Service = {
  protocol: { string: { string: any } },
  getRoot: string
}
```

### Type Program
```js
type Program = {
  condition: Object,
  action: { key: string, value: any }
}
```

### Type Instructions
```js
type Instructions = {
  service: Service,
  program: Program
}
```

### new ProgramGenerator (instructions: Instructions, intervalTime?: number = 5000): ProgramGenerator extends EventEmitter
* instructions: Instructions `instruction set to create the program`
* [intervalTime]: number `defaults to 5,000 milliseconds (5 seconds); timeout until checking if the latest MaM message update`

### deconstruct (): void
* null: void `used to remove any active intervals looking for new messages`

### getRoot (): string
* null: string `returns the current root of the MaM`

### Event: 'action'
* triggered when a instruction specified action has changed

---

## ISC License (ISC)

Copyright 2019 <IFTT>
Copyright (c) 2004-2010 by Internet Systems Consortium, Inc. ("ISC")
Copyright (c) 1995-2003 by Internet Software Consortium

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
