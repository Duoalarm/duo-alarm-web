const http = require("http"), fs = require("fs"), path = require("path");
const types = { ".html": "text/html;charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".ico": "image/x-icon" };
const PORT = process.env.PORT || 8077;
http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split("?")[0]);
  if (u === "/") u = "/index.html";
  let f = path.join(__dirname, u);
  if (!f.startsWith(__dirname)) { res.writeHead(403); return res.end("403"); }
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); return res.end("404 — " + u); }
    res.writeHead(200, { "Content-Type": types[path.extname(f)] || "application/octet-stream" });
    res.end(d);
  });
}).listen(PORT, () => console.log("Duo alarm site on http://localhost:" + PORT));
