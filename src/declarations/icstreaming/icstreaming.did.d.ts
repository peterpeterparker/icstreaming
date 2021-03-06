import type { Principal } from '@dfinity/principal';
export interface Asset {
  'key' : AssetKey__1,
  'encoding' : AssetEncoding,
  'headers' : Array<[string, string]>,
}
export interface AssetEncoding {
  'modified' : bigint,
  'totalLength' : bigint,
  'contentChunks' : Array<Array<number>>,
}
export interface AssetKey {
  'token' : [] | [string],
  'name' : string,
  'fullPath' : string,
  'folder' : string,
}
export interface AssetKey__1 {
  'token' : [] | [string],
  'name' : string,
  'fullPath' : string,
  'folder' : string,
}
export interface Chunk { 'content' : Array<number>, 'batchId' : bigint }
export type HeaderField = [string, string];
export type HeaderField__1 = [string, string];
export interface HttpRequest {
  'url' : string,
  'method' : string,
  'body' : Array<number>,
  'headers' : Array<HeaderField>,
}
export interface HttpResponse {
  'body' : Array<number>,
  'headers' : Array<HeaderField>,
  'streaming_strategy' : [] | [StreamingStrategy],
  'status_code' : number,
}
export type Result = { 'ok' : Asset } |
  { 'err' : string };
export interface StreamingCallbackHttpResponse {
  'token' : [] | [StreamingCallbackToken__1],
  'body' : Array<number>,
}
export interface StreamingCallbackToken {
  'token' : [] | [string],
  'sha256' : [] | [Array<number>],
  'fullPath' : string,
  'headers' : Array<HeaderField>,
  'index' : bigint,
}
export interface StreamingCallbackToken__1 {
  'token' : [] | [string],
  'sha256' : [] | [Array<number>],
  'fullPath' : string,
  'headers' : Array<HeaderField>,
  'index' : bigint,
}
export type StreamingStrategy = {
    'Callback' : {
      'token' : StreamingCallbackToken__1,
      'callback' : [Principal, string],
    }
  };
export interface _SERVICE {
  'commitUpload' : (
      arg_0: {
        'headers' : Array<HeaderField__1>,
        'chunkIds' : Array<bigint>,
        'batchId' : bigint,
      },
    ) => Promise<undefined>,
  'getAsset' : (arg_0: string) => Promise<Result>,
  'http_request' : (arg_0: HttpRequest) => Promise<HttpResponse>,
  'http_request_streaming_callback' : (
      arg_0: StreamingCallbackToken,
    ) => Promise<StreamingCallbackHttpResponse>,
  'initUpload' : (arg_0: AssetKey) => Promise<{ 'batchId' : bigint }>,
  'uploadChunk' : (arg_0: Chunk) => Promise<{ 'chunkId' : bigint }>,
}
