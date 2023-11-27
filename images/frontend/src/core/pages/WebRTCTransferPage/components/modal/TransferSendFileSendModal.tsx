import { useRef, useState } from 'react';
import styles from './TransferFileModal.module.css';
import "./TransferFileModal.module.css"
import { Socket } from 'socket.io-client';
import SimplePeer from 'simple-peer'; 


function TransferSendFileModal({ModalIsOpen,socket, username, setPeerRef,name}: {ModalIsOpen: Function,socket:Socket, setPeerRef:Function,username:string, name:string|undefined}  ) {
    const [selectedFile, setSelectedFile] = useState<Blob|null>(null);
    const [fileName, setFileName] = useState<string|undefined>(undefined);
    const [fileSize, setFileSize] = useState<string|undefined>(undefined);
    const peerRef = useRef<SimplePeer.Instance|undefined>()

    function handleFileChange(event:any ) {
        setSelectedFile(event.target.files[0]);
        setFileName(event.target.files[0].name);
        setFileSize((event.target.files[0].size / (1024 * 1024)).toFixed(2));        
    };

    // send request to receiver to start file transfer
    function sendRequest() {
        // check if file is selected
        if (selectedFile) {
            const peer = new SimplePeer({ initiator: true, trickle: false });
            // on signal send request to receiver
            peer.on('signal', (data:any) => {                
                socket.emit('send-request', {
                    sender: username,
                    receiver: name,
                    fileName: fileName,
                    fileSize: fileSize,
                    signalData: data,
                 });
                peerRef.current = peer;
                
            });

            // on peer error log error
            peer.on('error', (error) => {console.error(error)} );

            //when receiving response from receiver check if user accepted or rejected file transfer and start file transfer if accepted
            socket.on('send-response', (data:{signal:SimplePeer.SignalData, status:number}) => { 
                // if user accepted file transfer start file transfer               
                if (data.status === 200) {
                    try {                        
                        //signal other peer
                        peer.signal(data.signal);
                        //start file transfer
                        sendFile(peer);
                            
                    } catch (error) {
                        // log error
                        console.log(error);
                        
                    }
                    
                     
                } else {
                    console.log('other user rejected file transfer');

                }
            })

            
            
            

        }
    }

    // send file to receiver
    async function sendFile(peer:SimplePeer.Instance) {
        // max size of chunk send to receiver each time
        const ChunkSize = 1024 * 256;
        // check if file is selected
        if (!selectedFile) return;
        // create stream from selected file
        const stream = selectedFile.stream();
        const reader = stream.getReader();

        // Initial trigger to start the reading
        readChunk();

        // read the next chunk of data
        function readChunk() {
            reader.read().then((obj: any) => {
                handlereading(obj.done, obj.value);
            });
        }

        
        function handlereading(done: any, value: any) {
            // Check if the transfer is done and send done message to receiver
            if (done) {
                peer.write(JSON.stringify({ done: true, fileName: fileName }));
                return;
            }

            // Send a chunk of data
            peer.write(value.slice(0, ChunkSize));

            // Check if there's more data
            if (value.length > ChunkSize) {
                console.log(value.length);
                
                // Wait for a short time before sending the next chunk
                    handlereading(done, value.slice(ChunkSize));
            } else {
                // Continue reading the next chunk
                readChunk();
            }
        }

        

    }

    // remove selected file
    function removeFile() {
        setSelectedFile(null);
        setFileName(undefined);
        setFileSize(undefined);
    }

    
    

    return ( 
        <div className={styles.modalOverlay}>
            <div className={styles.modalContainer}>
                <div className={styles.horizontalView}>
                    <h2>Receiver: </h2>
                    <p>{name}</p>
                </div>
                {selectedFile ? 
                    <div className={styles.fileDetailsContainer}>
                        <div className={styles.fileDetails}>
                            <div className={styles.horizontalView}>
                                <h2>File name: </h2>
                                <p>{fileName}</p>
                            </div>
                            <div className={styles.horizontalView}>
                                <h2>File size: </h2>
                                <p>{fileSize} Mb</p>
                            </div>
                        </div>
                        <button onClick={removeFile}>remove file</button>
                    </div> 
                    
                    : 
                    
                    <div className={styles.fileInputContainer}>
                        <p>Please select or drag a file to send</p>
                        <input type="file" onChange={handleFileChange} />
                    </div>}
                    
                    <div className={styles.buttonContainer}>
                    <button className={styles.cancelButton} onClick={() => {ModalIsOpen(false)}} >cancel</button>  
                    <button className={styles.sendButton} onClick={sendRequest} disabled={selectedFile ? false : true}>send request</button>  
                    </div>
            </div>
        </div>
    );
}

export default TransferSendFileModal;