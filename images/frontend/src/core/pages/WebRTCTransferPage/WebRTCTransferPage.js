import { useState } from "react";
import { io } from "socket.io-client";
import Login from "./components/Login/login";

const socket = io('http://localhost:4001');

function WebRTCTransferPage() {
    const [username, setUsername] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);
    const [users, setUsers] = useState([]);

    socket.on('user-connected', (data) => {
       if(data.name !== username){
            console.log(data.name);
            setUsers([data.name, ...users ])
       }
    });


    return ( 
        <div>
            {errorMessage ? <p>{errorMessage}</p> : null}
            {username ? <p>Logged in as {username}</p> : null}
            {username ? null: <Login socket={socket} setUsername={setUsername} setErrorMessage={setErrorMessage} setUsers={setUsers} />}
            <ul>
                {users.map((user, index) => {
                    return <li key={index}>{user}</li>
                })}
            </ul>
        </div>
     );
}

export default WebRTCTransferPage;