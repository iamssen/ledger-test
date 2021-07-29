import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import TerraLedgerApp from '@terra-money/ledger-terra-js';
import React, { useCallback } from 'react';
import { render } from 'react-dom';

function App() {
  const getDeviceList = useCallback(async () => {
    const list = await TransportWebUSB.list();
    console.log('app.tsx..()', list);
  }, []);

  const test = useCallback(async () => {
    console.log('app.tsx..() test::start');
    const transport = await TransportWebUSB.create(1000 * 60 * 100000);
    const app = new TerraLedgerApp(transport);

    await app.initialize();
    console.log('app.tsx..() test::initialized');

    console.log('app.tsx..() test::getInfo', await app.getInfo());

    transport.on('disconnect', (...args) => {
      console.log('app.tsx..() test::disconnect', ...args);
    });

    console.log('index.tsx..App() test::getVersion', await app.getVersion());
  }, []);

  return (
    <div>
      <button onClick={test}>Test</button>
      <button onClick={getDeviceList}>Get Device List</button>
    </div>
  );
}

render(<App />, document.querySelector('#app'));
