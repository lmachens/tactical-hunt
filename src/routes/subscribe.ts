import { ServerHttp2Stream, IncomingHttpHeaders } from "node:http2";

export default (stream: ServerHttp2Stream, _headers: IncomingHttpHeaders) => {
  stream.respond({
    "content-type": "text/event-stream",
    "cache-control": "no-cache",
    ":status": 200,
  });

  stream.write("retry: 10000\n");
  stream.write("data: you are subscribed\n\n");
};
