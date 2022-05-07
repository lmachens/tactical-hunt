### HTTP/2

https://nodejs.org/dist/latest-v18.x/docs/api/http2.html

To generate the certificate and key for this example, run:

```sh
mkdir certs
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' \
  -keyout certs/localhost-privkey.pem -out certs/localhost-cert.pem
```

.vscode/settings.json

{
"typescript.tsdk": "node_modules/typescript/lib"
}
