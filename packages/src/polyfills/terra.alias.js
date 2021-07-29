/**
 * terra.js currently only works on webpack 4.0
 * - webpack 5.x can be work by node polyfills
 * - snowpack and vite can not be work (ws can not be parsed on ESM based system)
 */

export const {
  LCDClient,
  Int,
  Dec,
  Msg,
  MsgSend,
  MsgExecuteContract,
  MnemonicKey,
  StdFee,
  Wallet,
  AccAddress,
  Extension,
  RawKey,
  Key,
  MsgAuthAPI,
  Coin,
  Coins,
  PublicKey,
  StdSignature,
  StdTx,
} = window.Terra;
