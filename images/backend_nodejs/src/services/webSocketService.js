import { Server } from "socket.io"
import { createServer } from "http"


const server = createServer()
const users = [];
function webSocketService(webSocketPort) {

    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {

        socket.on("login", (data) => {
            // save user to user list
            const user = {
                id: socket.id,
                name: data.name,
            }
            // check if user already exists
            if (users.find(u => u.name === user.name)) {
                socket.emit("login",{
                    message: "User already exists",
                    status: 400,
                })
                console.log("user already exists", user);
            } else {
                const userNames = users.map(u => u.name);
                socket.emit("login",{
                    message: "Login successful",
                    status: 200,
                    users: userNames,
                
                })
                socket.broadcast.emit("user-connected", {
                    message: "User connected",
                    users: [...userNames, user.name],
                })
                users.push(user);
                console.log("user connected", user);

            }
        })

        socket.on("send-request", (data) => {
            // TODO: send file request to to the other user
            let receiver = users.find(u => u.name === data.receiver);
            if (receiver) {
                socket.to(receiver.id).emit("send-request", {
                    sender: data.sender,
                    filename: data.filename,
                    filesize: data.filesize,
                    signal: data.offer,
                    status: 200,

                });
            } else {
                socket.emit("send-request", {
                    message: "User not found",
                    status: 404,
                })
            }
        });

        socket.on("send-response", (data) => {
            // TODO: send response to original sender of file that the other user accepted or rejected the file request
            let receiver = users.find(u => u.name === data.receiver);
            if (receiver) {
                if (data.accepted) {
                    socket.to(receiver.id).emit("send-response", {
                        signal: data.signal,
                        status: 200,
                    });
                } else {
                    socket.to(receiver.id).emit("send-response", {
                        message: "User rejected file request",
                        status: 400,
                    });
                }
            } else {
                socket.emit("send-response", {
                    message: "User not found",
                    status: 404,
                })
            }
        });

        socket.on("disconnect", (data) => {
            // remove user from user list
            const user = users.find(u => u.id === socket.id);
            if (user) {
                users.splice(users.indexOf(user), 1);
                socket.broadcast.emit("user-disconnected", {
                    message: "User disconnected",
                    name: user.name,
                })
                console.log("user disconnected", user);
            }
        });
    });

    server.listen(webSocketPort, () => {
        console.log(`Socket.IO server running at http://localhost:${webSocketPort}/`);
    });
}

export default webSocketService;