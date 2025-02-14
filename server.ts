import { serveDir } from "jsr:@std/http/file-server";

const watcher = Deno.watchFs("./watch-changes");
console.log("watching changes..........");

const clients = new Set<WebSocket>();

Deno.serve({ port: 8000 }, (req: Request) => {
  if (req.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    socket.onopen = () => clients.add(socket);
    socket.addEventListener("open", () => {
      console.log("a client connected!");
    });
    socket.addEventListener("close", () => {
      console.log("connection closed!");
    });
    socket.addEventListener("message", (event) => {
      if (event.data === "ping") {
        socket.send("pong");
      }
    });
    socket.onclose = () => clients.delete(socket);
    return response;
  }
  return serveDir(req, { fsRoot: "./watch-changes" });
});

let timeout: number | undefined;
let cnt = 0;
for await (const event of watcher) {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    cnt += 1;
    console.log("Change detected");
    console.log("Total Count : ", cnt);
    // console.log("Event kind:", event.kind);
    clients.forEach((client) => client.send("reload"));
  }, 100);
}
