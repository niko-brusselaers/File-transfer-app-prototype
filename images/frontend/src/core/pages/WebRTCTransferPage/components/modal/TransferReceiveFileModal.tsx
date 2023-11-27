import styles from './TransferFileModal.module.css';
import "./TransferFileModal.module.css"
import { Socket } from 'socket.io-client';
import SimplePeer from 'simple-peer'; 
import streamSaver from 'streamsaver';
import { ISendRequestOutgoing } from '../../../../shared/models/webSocketInterfaces';
import { useRef, useState } from 'react';

const worker = new Worker('../worker.js');

function TransferReceiveFileModal({ModalIsOpen,socket, setPeerRef,senderData}: {ModalIsOpen: Function,socket:Socket, setPeerRef:Function,senderData:ISendRequestOutgoing}  ) {    
    const peerRef = useRef<SimplePeer.Instance|undefined>()
    const fileNameRef = useRef<string|undefined>(undefined);
    const [gotFile, setGotFile] = useState<Boolean>(false);

    // function to set send response to sender
    function handleAccept() {
        // create new peer
        const peer = new SimplePeer({ initiator: false, trickle: false });
        // on signal send response to sender
        peer.on('signal', (data) => {
            socket.emit('send-response', {
                receiver: senderData.sender,
                signalData: data,
                accepted: true
            });
        });

        // on peer error log error
        peer.on('error', (error) => {console.error(error)} );

        // when receiving data from sender, process data
        peer.on('data', handleReceivingData);
        
        if (senderData.signal) {
            peer.signal(senderData.signal);
        } else {
            console.error('Signal data is missing.');
        }

        peerRef.current = peer;

}

    // function to process data received from sender to a file
    function handleReceivingData(data:any) {
        //check if data is done and set gotFile to true
        if(data.toString().includes('done')) {
            setGotFile(true)
            const parsed = JSON.parse(data);
            fileNameRef.current = parsed.fileName;
        } else{
            // send data to worker to process data asynchronisly 
            worker.postMessage(data);
        }
    }

    //function to download file after transfer is done
    function downloadFile() {
        setGotFile(false);
        // send download message to worker
        worker.postMessage('download');
        // when receiving message from worker, create filestream and download file
        worker.addEventListener('message', (event) => {            
            const stream = event.data.stream();
            const fileStream= streamSaver.createWriteStream(fileNameRef.current!);
            stream.pipeTo(fileStream);
        });
    }

    // function to send response to sender that file transfer is declined and close modal
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
                            {gotFile ? <button onClick={()=> {downloadFile()}}>Download</button> : null}
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