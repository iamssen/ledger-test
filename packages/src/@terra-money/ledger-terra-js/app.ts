/** ******************************************************************************
 *  (c) 2019 ZondaX GmbH
 *  (c) 2016-2017 Ledger
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ******************************************************************************* */

import Transport from '@ledgerhq/hw-transport';
import { bech32 } from 'bech32';
import * as crypto from 'crypto';
import Ripemd160 from 'ripemd160';
import {
  getAddressAndPubKey,
  getAppInfo,
  getDeviceInfo,
  getVersion,
  publicKey,
  serializePath,
  showAddressAndPubKey,
  sign,
} from './device';
import {
  AppInfoResponse,
  CommonResponse,
  DeviceInfoResponse,
  PublicKeyResponse,
  SignResponse,
  VersionResponse,
} from './types';

const APP_NAME_TERRA = 'Terra';
const APP_NAME_COSMOS = 'Cosmos';

export default class TerraApp {
  private transport;
  private info!: AppInfoResponse;
  private version!: VersionResponse;

  constructor(transport: Transport) {
    if (!transport) {
      throw new Error('Transport has not been defined');
    }

    this.transport = transport;
  }

  static serializeHRP(hrp: string) {
    if (hrp == null || hrp.length < 3 || hrp.length > 83) {
      throw new Error('Invalid HRP');
    }
    const buf = Buffer.alloc(1 + hrp.length);
    buf.writeUInt8(hrp.length, 0);
    buf.write(hrp, 1);
    return buf;
  }

  static getBech32FromPK(hrp: string, pk: Buffer) {
    if (pk.length !== 33) {
      throw new Error('expected compressed public key [31 bytes]');
    }
    const hashSha256 = crypto.createHash('sha256').update(pk).digest();
    const hashRip = new Ripemd160().update(hashSha256).digest();
    return bech32.encode(hrp, bech32.toWords(hashRip));
  }

  private validateCompatibility(): CommonResponse | null {
    if (this.info && this.version) {
      if (this.info.return_code !== 0x9000) {
        return this.info;
      }

      if (this.version.return_code !== 0x9000) {
        return this.version;
      }

      if (
        (this.info.app_name === APP_NAME_TERRA && this.version.major === 1) ||
        (this.info.app_name === APP_NAME_COSMOS && this.version.major === 2)
      ) {
        return null;
      }
    }

    return {
      return_code: 0x6400,
      error_message: 'App Version is not supported',
    };
  }

  /**
   * @returns CommonResponse | null returns CommonResponse if app is not compatible
   */
  async initialize(): Promise<CommonResponse | null> {
    return getAppInfo(this.transport)
      .then((appInfo) => {
        this.info = appInfo;
        return getVersion(this.transport);
      })
      .then((version) => {
        this.version = version;
        return this.validateCompatibility();
      });
  }

  getInfo(): AppInfoResponse {
    return this.info;
  }

  getVersion(): VersionResponse {
    return this.version;
  }

  getDeviceInfo(): Promise<DeviceInfoResponse> {
    return getDeviceInfo(this.transport);
  }

  getPublicKey(
    path: [number, number, number, number, number],
  ): Promise<PublicKeyResponse> {
    const result = serializePath(path);
    const data = Buffer.concat([TerraApp.serializeHRP('terra'), result]);
    return publicKey(this.transport, data);
  }

  getAddressAndPubKey(
    path: [number, number, number, number, number],
    hrp: string,
  ): Promise<PublicKeyResponse> {
    const result = serializePath(path);
    const data = Buffer.concat([TerraApp.serializeHRP(hrp), result]);
    return getAddressAndPubKey(this.transport, data);
  }

  showAddressAndPubKey(
    path: [number, number, number, number, number],
    hrp: string,
  ): Promise<PublicKeyResponse> {
    const result = serializePath(path);
    const data = Buffer.concat([TerraApp.serializeHRP(hrp), result]);
    return showAddressAndPubKey(this.transport, data);
  }

  sign(
    path: [number, number, number, number, number],
    message: string,
  ): Promise<SignResponse> {
    return sign(this.transport, path, message);
  }
}
