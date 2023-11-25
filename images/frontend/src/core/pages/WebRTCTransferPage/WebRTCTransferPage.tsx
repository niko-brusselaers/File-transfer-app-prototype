import { useState } from "react";
import { io } from "socket.io-client";
import Login from "./components/Login/login";
import UserProfile from "./components/UserProfile/userProfile";
import styles from './WebRTCTransferPage.module.css';
const socket = io('http://localhost:4001');

function WebRTCTransferPage() {
    const [username, setUsername] = useState<string|undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState<string| undefined>(undefined);
    const [users, setUsers] = useState<string[]>([]);

    socket.on('user-connected', (data: {
    message: string;
    status: number;
    users: string[];
    }) => {
        console.log('user-connected event received:', data);
        setUsers(data.users.filter((user: string) => user !== username));
    });

    socket.on('user-disconnected', (data) => {
        console.log('user-disconnected event received:', data);
        setUsers(users.filter((user) => user !== data.name));
    });



    return ( 
        <div className={styles.WebRTCTransferContainer}>
            {errorMessage ? <p>{errorMessage}</p> : null}
            {username ? <p>Logged in as {username}</p> : null}
            {username ? null: <Login socket={socket} setUsername={setUsername} setErrorMessage={setErrorMessage} setUsers={setUsers} />}
            <div>
                {users ? users.map((user, index) => <UserProfile name={user} key={index}/>) : null}
            </div>
        </div>
     );
}

export default WebRTCTransferPage;