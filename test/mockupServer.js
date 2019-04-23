const express = require('express')
const Mam = require('@iftt/mam')

// HOW TO USE:
// After running this, the first message must be submitted, this will be the
// "starting point" and on completion (console log of root), you can start the client device

// steps:
// * server will send latest root
// * server updates feed every 35 seconds
// * 2 of the 3 messages are 0 eventRain and the other has 1 eventRain
// * encode the three messages in prep

const app = express()
let mamState = Mam.init('https://nodes.devnet.thetangle.org:443') // random seed so that fetch isnt "confusing" for device
let counter = 0
let messages = [ // the only thing that we are changing+testing is "eventrainin"
  'D9HRRK9MLLGQNPM9KZU99CD999I999V99BO99MND9HRRK9999L9999999Q999Q999Q99999DI9DBT9DBQCK99XUAT999999999GF99MN9DSK',
  'D9HRRK9MLLGQNPM9KZU99CD999I999V99BO99MND9HRRK9999L9999999Q999Q999Q99999DI9DBT9DBQCK99XUAT999999999GF99MN9DSK',
  'D9HRRKSMLLGQNPM9KZU99CD999I999V99BO99MND9HRRKS999L99CS999Q999Q999Q99999DI9DBT9DBQCK99XUAT999999999GF99MN9DSK'
]
// test for no action from 0->0, test for action from 0->1, test for no action from 1->1, test for no action from 1->0

app.get('/weather/getNextRoot', function (req, res) {
  res.status(200).send({ nextRoot: mamState.channel.next_root })
})

const server = app.listen(3001, () => {
  console.log('Listening at Port 3001')
})

// lets keep publishing the
_publish(messages[counter])
counter++
const interval = setInterval(() => {
  _publish(messages[counter])
  counter++
  if (counter > 3) { counter = 0 }
}, 15000)

async function _publish (trytes) {
  try {
    const message = Mam.create(mamState, trytes)
    // update and store the state
    mamState = message.state
    await Mam.attach(message.payload, message.address, 3, 9)
    console.log('Root:', message.root)
  } catch (err) {}
}

module.exports = {
  server,
  interval
}
