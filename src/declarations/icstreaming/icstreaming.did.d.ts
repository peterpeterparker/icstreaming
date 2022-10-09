import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

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
  'commitUpload' : ActorMethod<
    [
      {
        'headers' : Array<HeaderField__1>,
        'chunkIds' : Array<bigint>,
        'batchId' : bigint,
      },
    ],
    undefined,
  >,
  'getAsset' : ActorMethod<[string], Result>,
  'http_request' : ActorMethod<[HttpRequest], HttpResponse>,
  'http_request_streaming_callback' : ActorMethod<
    [StreamingCallbackToken],
    StreamingCallbackHttpResponse,
  >,
  'initUpload' : ActorMethod<[AssetKey], { 'batchId' : bigint }>,
  'uploadChunk' : ActorMethod<[Chunk], { 'chunkId' : bigint }>,
}
