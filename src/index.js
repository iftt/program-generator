// @flow
import EventEmitter from 'events';
import TryteBuffer  from '@iftt/tryte-buffer';
import * as Mam     from '@iftt/mam'; // https://devnet.thetangle.org/mam/
import jsonLogic    from 'json-logic-js'; // https://github.com/jwadhams/json-logic-js
import axios        from 'axios';

type Instructions = {
  service: Service,
  program: Program
};

type Service = {
  protocol: { string: { string: any } },
  getRoot: string
};

type Program = {
  condition: Object,
  action: { key: string, value: any }
};

class ProgramGenerator extends EventEmitter {
  previous: null | { string: { string: any } };
  current: null | { string: { string: any } };
  service: Service;
  serviceProtocol: TryteBuffer;
  program: Program;
  intervalTime: number;
  interval: setInterval;
  constructor(instructions: Instructions, intervalTime?: number = 5000) {
    super();
    this.service = instructions.service;
    this.program = instructions.program;
    this.intervalTime = intervalTime;
    // setup proper tryte-buffer from protocol
    this.serviceProtocol = new TryteBuffer(this.service.protocol);
    // use getRoot and then set an interval to "onData" any res
    this.getCurrentRoot();
  }

  deconstruct() {
    clearInterval(this.interval);
  }

  getCurrentRoot() {
    const self = this;
    self.getRoot()
      .then(nextRoot => {
        self.createSubscription(nextRoot);
      })
      .catch(err => {
        console.log('err', err);
        setTimeout(() => {
          self.getCurrentRoot();
        }, 10000); // try every 10 seconds
      });
  }

  getRoot(): Promise<string> {
    const self = this;
    return new Promise((res, rej) => {
      axios
        .post(self.service.getRoot, {
          apiToken: process.env.API_TOKEN
        })
        .then((response) => {
          res(response.data.nextRoot);
        })
        .catch((error) => {
          rej(error);
        });
    });
  }

  createSubscription(root: string) {
    const self = this;
    self.interval = setInterval(async () => {
      let message = await Mam.fetch(root, 'public', null);
      if (message && message.messages && message.messages.length) {
        root = message.nextRoot;
        const payload = message.messages[0].payload;
        // decode and 'handle'
        self.onData(self.serviceProtocol.decode(payload));
      }
    }, self.intervalTime);
  }

  onData(data: { string: { string: any } }) {
    const { condition, action } = this.program; // snag the program values
    // move the 'current' data backwards and make current the new true current value
    this.previous = this.current;
    this.current = data;
    const bool = jsonLogic.apply(condition, { previous: this.previous, current: this.current });

    if (bool)
      this.emit('action', action);
  }
}


export default ProgramGenerator;

// How it should work
// * class object that stores the tryte-protocol, the program, how to find the current root, and on the side pull in an MaM
// * upon instantiation it should auto ask the root and start listening
// * maintain a "previous" value
// * should create a function that takes the program params and prep for inputs with a callback (current, previous, cb)
// * Program system should handle dates, booleans, numbers, strings, nulls, etc
// * the program system:
// * * minimum inputs allowed are, "current object", "previous object", "&&", "||", "==", "!=", "<", ">", "<=", ">="
// * * emit an event of the action upon statement being true
