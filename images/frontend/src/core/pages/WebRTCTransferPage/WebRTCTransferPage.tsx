import { useRef, useState } from "react";
import * as process from 'process';
import { io } from "socket.io-client";
import Login from "./components/Login/login";
import UserProfile from "./components/UserProfile/userProfile";
import styles from './WebRTCTransferPage.module.css';
import SimplePeer from 'simple-peer';
import {IUserConnected, ISendRequestIncoming, IUserDisconnected } from "../../shared/models/webSocketInterfaces"
import TransferSendFileModal from "./components/modal/TransferSendFileSendModal";
import TransferReceiveFileModal from "./components/modal/TransferReceiveFileModal";

(window as any).global = window;
(window as any).process = process;
(window as any).Buffer = [];

const socket = io(`${process.env.REACT_APP_BACKEND_WEBSOCKET_URL}`);


function WebRTCTransferPage() {
    const [username, setUsername] = useState<string|undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState<string| undefined>(undefined);
    const [users, setUsers] = useState<string[]>([]);
    const [sendModalIsOpen, setSendModalIsOpen] = useState<boolean>(false);
    const [receiveModalIsOpen, setReceiveModalIsOpen] = useState<boolean>(false);
    const [receiverName, setReceiverName] = useState<string|undefined>(undefined);
    const [senderData, setSenderData] = useState<ISendRequestIncoming|undefined>(undefined);

    const peerRef = useRef<SimplePeer.Instance| undefined>(undefined);

    socket.on('user-connected', (data: IUserConnected) => {
        setUsers(data.users.filter((user: string) => user !== username));
    });

    socket.on('user-disconnected', (data:IUserDisconnected) => {
        setUsers(users.filter((user) => user !== data.name));
    });

    socket.on('send-request', (data:any) => {
        console.log('send-request event received:', data);
        setSenderData(data);
        setReceiveModalIsOpen(true);

    })

    function sendFileRequest(name: string) {
        setReceiverName(name);
        setSendModalIsOpen(true);
        
    }

    function setPeerRef(peer: SimplePeer.Instance) {
        peerRef.current = peer;
    }
    

    return ( 
        <div className={styles.WebRTCTransferContainer}>
            {errorMessage ? <p className={styles.errorMessage}>{errorMessage}</p> : null}
            {username ? <p className={styles.username}>Logged in as:  {username}</p> : null}
            {username ? null: <Login socket={socket} setUsername={setUsername} setErrorMessage={setErrorMessage} setUsers={setUsers} />}
            <div className={username ? undefined : styles.userListHidden}>
                {users ? users.map((user, index) => <UserProfile name={user} sendFileRequest={sendFileRequest} key={index}/>) : null}
            </div>
            {sendModalIsOpen ? <TransferSendFileModal ModalIsOpen={setSendModalIsOpen} socket={socket} name={receiverName} setPeerRef={setPeerRef} username={username!} /> : null}
            {receiveModalIsOpen ? <TransferReceiveFileModal ModalIsOpen={setReceiveModalIsOpen} socket={socket} senderData={senderData!} setPeerRef={setPeerRef}  /> : null}
        </div>
     );
}

export default WebRTCTransferPage;