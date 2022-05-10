import http2 from "node:http2";
import fs from "node:fs";

import subscribe from "./routes/subscribe.js";
import favicon from "./routes/favicon.js";
import scripts from "./routes/scripts.js";
import styles from "./routes/styles.js";
import html from "./routes/html.js";
import notFound from "./routes/notFound.js";

const PORT = 8443;
const GREEN = "\x1b[32m";

const server = http2.createSecureServer({
  key: fs.readFileSync("./certs/localhost-privkey.pem"),
  cert: fs.readFileSync("./certs/localhost-cert.pem"),
});

server.on("error", (err) => console.error(err));

const routes: {
  [path: string]: (
    stream: http2.ServerHttp2Stream,
    headers: http2.IncomingHttpHeaders
  ) => void | Promise<void>;
} = {
  "/": html,
  "/subscribe": subscribe,
  "/favicon.ico": favicon,
};
server.on("stream", (stream, headers) => {
  const path = headers[":path"] as string;

  console.log(GREEN, `Request ${path}`);
  const route = routes[path];
  if (route) {
    route(stream, headers);
  } else if (path.endsWith(".js")) {
    scripts(stream, headers);
  } else if (path.endsWith(".css")) {
    styles(stream, headers);
  } else {
    notFound(stream, headers);
  }
});

server.listen(PORT, () => {
  console.log(GREEN, `Server running on https://localhost:${PORT}`);
});
