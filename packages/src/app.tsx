import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import TerraLedgerApp from '@terra-money/ledger-terra-js';
import React, { useCallback } from 'react';
import { render } from 'react-dom';
import {
  CreateTxOptions,
  LCDClient,
  MsgSend,
  PublicKey,
  StdFee,
  StdSignature,
  StdSignMsg,
  StdTx,
} from '@terra-money/terra.js';
import { signatureImport } from 'secp256k1';
import { Key } from './terrajs/Key';

const path: [number, number, number, number, number] = [44, 330, 0, 0, 0];

class LedgerKey extends Key {
  constructor(publicKey: Buffer | undefined, private app: TerraLedgerApp) {
    super(publicKey);
  }

  sign(payload: Buffer): Promise<Buffer> {
    throw new Error('');
  }

  createSignature = async (tx: StdSignMsg): Promise<StdSignature> => {
    const publicKeyBuffer = this.publicKey;

    if (!publicKeyBuffer) {
      throw new Error(`Can't get publicKey`);
    }

    const serializedTx = tx.toJSON();

    const signature = await this.app.sign(path, serializedTx);
    const signatureBuffer = Buffer.from(
      signatureImport(Buffer.from(signature.signature.data)),
    );

    if (!signatureBuffer) {
      throw new Error(`Can't get signature`);
    }

    return new StdSignature(
      signatureBuffer.toString('base64'),
      PublicKey.fromData({
        type: 'tendermint/PubKeySecp256k1',
        value: publicKeyBuffer.toString('base64'),
      }),
    );
  };
}

function App() {
  const getDeviceList = useCallback(async () => {
    const list = await TransportWebUSB.list();
    console.log('app.tsx..()', list);
  }, []);

  const test = useCallback(async () => {
    console.log('test::start');
    const transport = await TransportWebUSB.create(1000 * 60 * 100000);
    const app = new TerraLedgerApp(transport);

    await app.initialize();
    console.log('test::initialized');

    console.log('test::getInfo', await app.getInfo());

    transport.on('disconnect', (...args) => {
      console.log('test::disconnect', ...args);
    });

    console.log('test::getVersion', await app.getVersion());

    const publicKey = await app.getAddressAndPubKey(path, 'terra');
    console.log('test::publicKey', publicKey);

    const publicKeyBuffer = Buffer.from(publicKey.compressed_pk as any);
    console.log('test::publicKeyBuffer', publicKeyBuffer);

    const tx: CreateTxOptions = {
      fee: new StdFee(1000000, '200000uusd'),
      msgs: [
        new MsgSend(
          publicKey.bech32_address,
          'terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9',
          {
            uusd: 1000000,
          },
        ),
      ],
    };

    const lcd = new LCDClient({
      chainID: 'tequila-0004',
      URL: 'https://tequila-lcd.terra.dev',
    });

    const key = new LedgerKey(publicKeyBuffer, app);
    const stdTx: StdTx = await lcd.wallet(key).createAndSignTx(tx);

    const result = await lcd.tx.broadcastSync(stdTx);

    console.log('app.tsx..()', result);
  }, []);

  return (
    <div>
      <button onClick={test}>Test</button>
      <button onClick={getDeviceList}>Get Device List</button>
    </div>
  );
}

render(<App />, document.querySelector('#app'));
