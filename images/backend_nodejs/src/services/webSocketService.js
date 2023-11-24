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
                socket.emit("login",{
                    message: "Login successful",
                    status: 200,
                
                })
                socket.emit("user-connected", {
                    message: "User connected",
                    status: 200,
                    name: user.name
                })
                users.push(user);
                console.log("user connected", user);

            }
        })

        socket.on("send-request", (data) => {
            // TODO: send file request to to the other user
        });

        socket.on("send-response", (data) => {
            // TODO: send response to original sender of file that the other user accepted or rejected the file request
        });

        socket.on("disconnect", (data) => {
            // remove user from user list
            const user = users.find(u => u.id === socket.id);
            if (user) {
                users.splice(users.indexOf(user), 1);
            }
            console.log("user disconnected", user);
        });
    });

    server.listen(webSocketPort, () => {
        console.log(`Socket.IO server running at http://localhost:${webSocketPort}/`);
    });
}

export default webSocketService;