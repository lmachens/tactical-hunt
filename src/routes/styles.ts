import { ServerHttp2Stream, IncomingHttpHeaders } from "node:http2";
import { readAppFile } from "../lib/filesystem.js";

export default (stream: ServerHttp2Stream, headers: IncomingHttpHeaders) => {
  const path = headers[":path"] as string;
  try {
    stream.respond({
      "content-type": "text/css",
      ":status": 200,
    });
    stream.end(readAppFile(path));
  } catch (error) {
    stream.respond({
      ":status": 404,
    });
    stream.end();
  }
};
