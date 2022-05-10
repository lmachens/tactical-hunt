import { readAppFile } from "../lib/filesystem.js";
import { ServerHttp2Stream, IncomingHttpHeaders } from "node:http2";

export default (stream: ServerHttp2Stream, _headers: IncomingHttpHeaders) => {
  stream.respond({
    "content-type": "text/html; charset=utf-8",
    ":status": 200,
  });

  stream.end(readAppFile("/index.html"));
};
