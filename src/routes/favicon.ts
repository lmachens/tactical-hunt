import { ServerHttp2Stream, IncomingHttpHeaders } from "node:http2";
import { readAppFile } from "../lib/filesystem.js";

export default (stream: ServerHttp2Stream, _headers: IncomingHttpHeaders) => {
  stream.respond({
    "content-type": "image/x-icon",
    ":status": 200,
  });
  stream.end(readAppFile("/favicon.ico"));
};
