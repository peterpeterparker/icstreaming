import { icstreaming } from "../../declarations/icstreaming";

const displayResultImg = (url) => {
  const img = document.querySelector("img#ic");
  img.src = url;
};

const uploadChunk = async ({ batchId, chunk }) =>
  icstreaming.uploadChunk({
    batchId,
    content: [...new Uint8Array(await chunk.arrayBuffer())],
  });

const encodeFilename = (filename) => encodeURI(filename.toLowerCase().replace(/\s/g, '-'));

const upload = async () => {
  const input = document.querySelector("input");

  const file = input?.files[0];

  const { name } = file;

  // Batch

  const filename = encodeFilename(name);
  const fullPath = `/data/${filename}`;

  const { batchId } = await icstreaming.initUpload({
    name: filename,
    fullPath,
    token: [],
    folder: "data",
  });

  console.log({ batchId });

  // Chunks

  const promises = [];

  const chunkSize = 700000;

  const clone = new Blob([await file.arrayBuffer()]);

  for (let start = 0; start < clone.size; start += chunkSize) {
    const chunk = clone.slice(start, start + chunkSize);

    promises.push(
      uploadChunk({
        batchId,
        chunk,
      })
    );
  }

  const chunkIds = await Promise.all(promises);

  console.log({ chunkIds });

  // Commit batch

  await icstreaming.commitUpload({
    batchId,
    chunkIds: chunkIds.map(({ chunkId }) => chunkId),
    headers: [
      ["Content-Type", file.type],
      ["accept-ranges", "bytes"],
      ["cache-control", "private, max-age=0"],
    ],
  });

  console.log("Commit");

  displayResultImg(
    `http://${process.env.ICSTREAMING_CANISTER_ID}.localhost:8000${fullPath}`
  );
};

const previewImg = () => {
  const input = document.querySelector("input");
  const img = document.querySelector("img#local");

  input.oninput = () => {
    img.src = window.URL.createObjectURL(input.files[0]);
  }
}

const init = () => {
  const button = document.querySelector("button");
  button.addEventListener("click", upload);

  previewImg();
};

document.addEventListener("DOMContentLoaded", init);
