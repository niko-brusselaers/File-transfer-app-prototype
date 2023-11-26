import styles from './TransferFileModal.module.css';
import "./TransferFileModal.module.css"
import { Socket } from 'socket.io-client';
import SimplePeer from 'simple-peer'; 
import { ISendRequestOutgoing } from '../../../../shared/models/webSocketInterfaces';
import { useRef, useState } from 'react';


function TransferReceiveFileModal({ModalIsOpen,socket, setPeerRef,senderData}: {ModalIsOpen: Function,socket:Socket, setPeerRef:Function,senderData:ISendRequestOutgoing}  ) {    
    const peerRef = useRef<SimplePeer.Instance|undefined>()
    const fileNameRef = useRef<string|undefined>(undefined);
    const [gotFile, setGotFile] = useState<boolean>(false);
    const [file, setFile] = useState<Blob|undefined>(undefined);
    
    function handleAccept() {
    const peer = new SimplePeer({ initiator: false, trickle: false });

    peer.on('signal', (data) => {
        socket.emit('send-response', {
            receiver: senderData.sender,
            signalData: data,
            accepted: true
        });
    });

    peer.on('error', (error) => {console.error(error)} );

    peer.on('data', (data) => {handleReceivingData(data)});

    if (senderData.signal) {
        peer.signal(senderData.signal);
    } else {
        console.error('Signal data is missing.');
    }

    peerRef.current = peer;

}


    function handleReceivingData(data:any) {
        console.log(data);        
        if (data.toString().includes("done")) {
            setGotFile(true);
            const parsed = JSON.parse(data);
            fileNameRef.current = parsed.fileName;
        } else {
        }
    }

    function handleDecline(){
        ModalIsOpen(false)

        socket.emit('send-response', {
            receiver: senderData.sender,
            accpeted: false
        })
    }

    


    return ( 
        <div className={styles.modalOverlay}>
            <div className={styles.modalContainer}>
                <div className={styles.horizontalView}>
                    <h2>Receiver: </h2>
                    <p>{senderData.sender}</p>
                </div>
                    
                    <div className={styles.fileDetailsContainer}>
                        <div className={styles.fileDetails}>
                            <div className={styles.horizontalView}>
                                <h2>File name: </h2>
                                <p>{senderData.filename}</p>
                            </div>
                            <div className={styles.horizontalView}>
                                <h2>File size: </h2>
                                <p>{senderData.filesize} Mb</p>
                            </div>
                        </div>
                    </div> 
                    
                    <div className={styles.buttonContainer}>
                    <button className={styles.cancelButton} onClick={() => {handleDecline()}} >Decline</button>  
                    <button className={styles.sendButton} onClick={() => {handleAccept()}}>Accept</button>  
                    </div>
            </div>
        </div>
    );
}

export default TransferReceiveFileModal;