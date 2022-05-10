import { ServerHttp2Stream, IncomingHttpHeaders } from "node:http2";

export default (stream: ServerHttp2Stream, _headers: IncomingHttpHeaders) => {
  stream.respond({
    ":status": 404,
  });
  stream.end();
};
