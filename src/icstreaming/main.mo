import Result "mo:base/Result";
import Blob "mo:base/Blob";
import Text "mo:base/Text";
import Error "mo:base/Error";
import Principal "mo:base/Principal";

import StorageStore "./storage.store";

import HTTP "./http.types";
import StorageTypes "./storage.types";


actor Main {

  private type Asset = StorageTypes.Asset;
    private type AssetKey = StorageTypes.AssetKey;
    private type AssetEncoding = StorageTypes.AssetEncoding;
    private type Chunk = StorageTypes.Chunk;

    private type HttpRequest = HTTP.HttpRequest;
    private type HttpResponse = HTTP.HttpResponse;
    private type HeaderField = HTTP.HeaderField;
    private type StreamingCallbackHttpResponse = HTTP.StreamingCallbackHttpResponse;
    private type StreamingCallbackToken = HTTP.StreamingCallbackToken;
    private type StreamingStrategy = HTTP.StreamingStrategy;

    let storageStore: StorageStore.StorageStore = StorageStore.StorageStore();
  
/**
* HTTP
**/

  public shared query({caller}) func http_request({method: Text; url: Text;} : HttpRequest) : async HttpResponse {
        try {
            if (Text.notEqual(method, "GET")) {
                return {
                    body = Blob.toArray(Text.encodeUtf8("Method Not Allowed."));
                    headers = [];
                    status_code = 405;
                    streaming_strategy = null;
                };
            };

            let result: Result.Result<Asset, Text> = storageStore.getAssetForUrl(url);

            switch (result) {
                case (#ok {key: AssetKey; headers: [HeaderField]; encoding: AssetEncoding;}) {
                    return {
                        body = encoding.contentChunks[0];
                        headers;
                        status_code = 200;
                        streaming_strategy = createStrategy(key, encoding, headers);
                    };
                };
                case (#err error) {
                };
            };

            return {
                body = Blob.toArray(Text.encodeUtf8("Permission denied. Could not perform this operation."));
                headers = [];
                status_code = 403;
                streaming_strategy = null;
            };
        } catch (err) {
            return {
                body = Blob.toArray(Text.encodeUtf8("Unexpected error: " # Error.message(err)));
                headers = [];
                status_code = 500;
                streaming_strategy = null;
            };
        }
    };

    public shared query({caller}) func http_request_streaming_callback(streamingToken: StreamingCallbackToken) : async StreamingCallbackHttpResponse {
        let result: Result.Result<Asset, Text> = storageStore.getAsset(streamingToken.fullPath, streamingToken.token);

        switch (result) {
            case (#ok {key: AssetKey; headers: [HeaderField]; encoding: AssetEncoding;}) {
                return {
                    token = createToken(key, streamingToken.index, encoding, headers);
                    body = encoding.contentChunks[streamingToken.index];
                };
            };
            case (#err error) {
                throw Error.reject("Streamed asset not found: " # error);
            };
        };
    };

    private func createStrategy(key: AssetKey, encoding: AssetEncoding, headers: [HeaderField]) : ?StreamingStrategy {
        let streamingToken: ?StreamingCallbackToken = createToken(key, 0, encoding, headers);

        switch (streamingToken) {
            case (null) { null };
            case (?streamingToken) {
                // Hack: https://forum.dfinity.org/t/cryptic-error-from-icx-proxy/6944/8
                // Issue: https://github.com/dfinity/candid/issues/273

                let self: Principal = Principal.fromActor(Main);
                let canisterId: Text = Principal.toText(self);

                let canister = actor (canisterId) : actor { http_request_streaming_callback : shared () -> async () };

                return ?#Callback({
                    token = streamingToken;
                    callback = canister.http_request_streaming_callback;
                });
            };
        };
    };

    private func createToken(key: AssetKey, chunkIndex: Nat, encoding: AssetEncoding, headers: [HeaderField]) : ?StreamingCallbackToken {
        if (chunkIndex + 1 >= encoding.contentChunks.size()) {
            return null;
        };

        let streamingToken: ?StreamingCallbackToken = ?{
            fullPath = key.fullPath;
            token = key.token;
            headers;
            index = chunkIndex + 1;
            sha256 = null;
        };

        return streamingToken;
    };

    /**
     * Upload
     */

    public func initUpload(key: AssetKey) : async ({batchId : Nat}) {
        let nextBatchID: Nat = storageStore.createBatch(key);

        return {batchId = nextBatchID};
    };

    public func uploadChunk(chunk: Chunk) : async ({chunkId : Nat}) {
        let (result: {#chunkId: Nat; #error: Text;}) = storageStore.createChunk(chunk);

        switch (result) {
            case (#error error) {
                throw Error.reject(error);
            };
            case (#chunkId chunkId) {
                return {chunkId};
            };
        };
    };

    public func commitUpload(
        {batchId; chunkIds; headers;} : {
            batchId: Nat;
            headers: [HeaderField];
            chunkIds: [Nat];
        },
    ) : async () {
        let ({error}: {error: ?Text;}) = storageStore.commitBatch({batchId; headers; chunkIds;});

        switch (error) {
            case (?error) {
                throw Error.reject(error);
            };
            case null {};
        };
    };

};
