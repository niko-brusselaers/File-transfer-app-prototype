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
                // if user does not exist, add user to user list and send user list along with login success message
                const userNames = users.map(u => u.name);
                socket.emit("login",{
                    message: "Login successful",
                    status: 200,
                    users: userNames,
                
                })
                // send user list to all other users when a new user connects
                socket.broadcast.emit("user-connected", {
                    message: "User connected",
                    users: [...userNames, user.name],
                })
                // add user to user list
                users.push(user);

            }
        })

        socket.on("send-request", (data) => {
            // send file request to to the other user
            let receiver = users.find(u => u.name === data.receiver);
            if (receiver) {
                // send file request to receiver
                socket.to(receiver.id).emit("send-request", {
                    sender: data.sender,
                    filename: data.fileName,
                    filesize: data.fileSize,
                    signal: data.signalData,
                    status: 200,

                });
            } else {
                // if receiver not found, send error message to sender
                socket.emit("send-request", {
                    message: "User not found",
                    status: 404,
                })
            }
        });

        socket.on("send-response", (data) => {
            console.log("send-response", data);
            // send response to original sender of file that the other user accepted or rejected the file request
            let receiver = users.find(u => u.name === data.receiver);
            if (receiver) {
                // if user accepted file request, send file request to sender
                if (data.accepted) {
                    socket.to(receiver.id).emit("send-response", {
                        signal: data.signalData,
                        status: 200,
                    });
                } else {
                    // if user rejected file request, send error message to sender
                    socket.to(receiver.id).emit("send-response", {
                        message: "User rejected file request",
                        status: 400,
                    });
                }
            } else {
                // if receiver not found, send error message to sender
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
                // remove user from user list
                users.splice(users.indexOf(user), 1);
                // send removed user to all other users
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