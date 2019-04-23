// @flow
import EventEmitter from 'events'
import TryteBuffer from '@iftt/tryte-buffer' // https://github.com/iftt/tryte-buffer
import * as Mam from '@iftt/mam' // https://devnet.thetangle.org/mam/
import jsonLogic from 'json-logic-js' // https://github.com/jwadhams/json-logic-js
import axios from 'axios'

const debug = require('debug')('program-generator')

export type Service = {
  protocol: { string: { string: any } },
  getRoot: string
}

export type Program = {
  condition: Object,
  action: { key: string, value: any }
}

export type Instructions = {
  service: Service,
  program: Program
}

class ProgramGenerator extends EventEmitter {
  previous: null | { string: { string: any } }
  current: null | { string: { string: any } }
  service: Service
  serviceProtocol: TryteBuffer
  program: Program
  intervalTime: number
  interval: Function
  constructor (instructions: Instructions, intervalTime?: number = 5000) {
    super()
    debug('creating ProgramGenerator')
    this.service = instructions.service
    this.program = instructions.program
    this.intervalTime = intervalTime
    // setup proper tryte-buffer from protocol
    this.serviceProtocol = new TryteBuffer(this.service.protocol)
    // use getRoot and then set an interval to "onData" any res
    this.getCurrentRoot()
  }

  deconstruct () {
    debug('deconstruct')
    clearInterval(this.interval)
  }

  getCurrentRoot () {
    debug('getCurrentRoot')
    const self = this
    self.getRoot()
      .then(nextRoot => {
        self.createSubscription(nextRoot)
      })
      .catch((err: Error) => {
        console.log('could not get root.. trying again in 10 seconds', err)
        setTimeout(() => {
          self.getCurrentRoot()
        }, 10000) // try every 10 seconds
      })
  }

  getRoot (): Promise<string> {
    debug('getRoot')
    const self = this
    return new Promise((resolve, reject) => {
      axios
        .get(self.service.getRoot)
        .then((response: axios.Response) => {
          resolve(response.data.nextRoot)
        })
        .catch((error: Error) => {
          reject(error)
        })
    })
  }

  createSubscription (root: string) {
    debug('createSubscription - %s', root)
    const self = this
    self.interval = setInterval(async () => {
      let message = await Mam.fetch(root, 'public', null)
      if (message && message.messages && message.messages.length) {
        root = message.nextRoot
        const payload = message.messages[0].payload
        // decode and 'handle'
        self.onData(self.serviceProtocol.decode(payload))
      }
    }, self.intervalTime)
  }

  onData (data: { string: { string: any } }) {
    debug('onData')
    const { condition, action } = this.program // snag the program values
    // move the 'current' data backwards and make current the new true current value
    this.previous = this.current
    this.current = data
    const bool = jsonLogic.apply(condition, { previous: this.previous, current: this.current })

    if (bool) { this.emit('action', action) }
  }
}

export default ProgramGenerator
