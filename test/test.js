const test = require('tape');
const mockServer = require('./mockupServer.js').default;
const ProgramGenerator = require('../lib').default;
const weatherProgram = require('./weatherProgram.json');

// const Mam     = require('@iftt/mam');
// Mam.init('https://nodes.devnet.thetangle.org:443');

setTimeout(() => {
  test('timing test', function (t) {
    t.plan(5);

    const wProgram = new ProgramGenerator(weatherProgram);

    wProgram.on('action', action => {
      // if we get here, the TryteBuffer is working just fine
      t.equal(JSON.stringify(action), JSON.stringify({ key: 'garageDoor', value: 1 }), 'ensure action is working & correctly');

      wProgram.deconstruct();
      clearInterval(mockServer.interval);
      mockServer.app.close();
    });

    t.equal(JSON.stringify(wProgram.service), JSON.stringify(weatherProgram.service), 'ensure service is saved correctly');
    t.equal(JSON.stringify(wProgram.program), JSON.stringify(weatherProgram.program), 'ensure program is saved correctly');
    t.equal(wProgram.intervalTime, 5000, 'ensure intervalTime is saved correctly');
    t.equal(typeof wProgram.serviceProtocol.decode === 'function', true, 'ensure the protocol was loaded into the tryte-buffer and decode is there');

    setTimeout(() => {
      // failing i guess...
      wProgram.deconstruct();
      clearInterval(mockServer.interval);
      mockServer.app.close();
    }, 1000 * 60 * 3); // 3 minutes
  });
}, 5000);
