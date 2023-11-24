import { Server } from "socket.io"
import { createServer } from "http"
const server = createServer()
function webSocketService(webSocketPort) {

    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {

        socket.on("connect", (data) => {
            // TODO: save user to user list

        })

        socket.on("send-request", (data) => {
            // TODO: send file request to to the other user
        });

        socket.on("send-response", (data) => {
            // TODO: send response to original sender of file that the other user accepted or rejected the file request
        });

        socket.on("disconnect", () => {
            console.log("user disconnected");
        });
    });

    server.listen(webSocketPort, () => {
        console.log(`Socket.IO server running at http://localhost:${webSocketPort}/`);
    });
}

export default webSocketService;