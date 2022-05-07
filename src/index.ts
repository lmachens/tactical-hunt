import http2 from "node:http2";
import fs from "node:fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 8443;
const GREEN = "\x1b[32m";

const server = http2.createSecureServer({
  key: fs.readFileSync("certs/localhost-privkey.pem"),
  cert: fs.readFileSync("certs/localhost-cert.pem"),
});

server.on("error", (err) => console.error(err));
server.on("stream", (stream, headers) => {
  const path = headers[":path"] as string;
  console.log(GREEN, `Request ${path}`);
  if (path === "/favicon.ico") {
    stream.respond({
      "content-type": "image/x-icon",
      ":status": 200,
    });
    stream.end(fs.readFileSync(__dirname + "/app/favicon.ico"));
  } else if (path.endsWith(".js")) {
    const file = fs.readFileSync(__dirname + "/app" + path);

    stream.respond({
      "content-type": "text/javascript",
      ":status": 200,
    });
    stream.end(file);
  } else if (path.endsWith(".css")) {
    const file = fs.readFileSync(__dirname + "/app" + path);

    stream.respond({
      "content-type": "text/css",
      ":status": 200,
    });
    stream.end(file);
  } else if (path === "/") {
    stream.respond({
      "content-type": "text/html; charset=utf-8",
      ":status": 200,
    });

    stream.end(fs.readFileSync(__dirname + "/app/index.html"));
  } else {
    stream.respond({
      ":status": 404,
    });
    stream.end();
  }
});

server.listen(PORT, () => {
  console.log(GREEN, `Server running on https://localhost:${PORT}`);
});
