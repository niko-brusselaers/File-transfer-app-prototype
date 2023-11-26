import { useRef, useState } from "react";
import { io } from "socket.io-client";
import Login from "./components/Login/login";
import UserProfile from "./components/UserProfile/userProfile";
import styles from './WebRTCTransferPage.module.css';
import TransferFileModal from "./components/modal/TransferFileModal";
const socket = io('http://localhost:4001');

function WebRTCTransferPage() {
    const [username, setUsername] = useState<string|undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState<string| undefined>(undefined);
    const [users, setUsers] = useState<string[]>([]);
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
    const [receiverName, setReceiverName] = useState<string|undefined>(undefined);

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

    function sendFileRequest(name: string) {
        setReceiverName(name);
        setModalIsOpen(true);
        
    }

    return ( 
        <div className={styles.WebRTCTransferContainer}>
            {errorMessage ? <p className={styles.errorMessage}>{errorMessage}</p> : null}
            {username ? <p className={styles.username}>Logged in as:  {username}</p> : null}
            {username ? null: <Login socket={socket} setUsername={setUsername} setErrorMessage={setErrorMessage} setUsers={setUsers} />}
            <div className={username ? undefined : styles.userListHidden}>
                {users ? users.map((user, index) => <UserProfile name={user} sendFileRequest={sendFileRequest} key={index}/>) : null}
            </div>
            {modalIsOpen ? <TransferFileModal ModalIsOpen={setModalIsOpen} socket={socket} name={receiverName} /> : null}
        </div>
     );
}

export default WebRTCTransferPage;