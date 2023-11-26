import { useState } from 'react';
import styles from './TransferFileModal.module.css';
import "./TransferFileModal.module.css"
import { Socket } from 'socket.io-client';
import SimplePeer from 'simple-peer'; 


function TransferFileModal({ModalIsOpen,socket, username, setPeerRef,name}: {ModalIsOpen: Function,socket:Socket, setPeerRef:Function,username:string, name:string|undefined}  ) {
    const [selectedFile, setSelectedFile] = useState<Blob|null>(null);
    const [fileName, setFileName] = useState<string|undefined>(undefined);
    const [fileSize, setFileSize] = useState<string|undefined>(undefined);

    function handleFileChange(event:any ) {
        setSelectedFile(event.target.files[0]);
        setFileName(event.target.files[0].name);
        setFileSize((event.target.files[0].size / (1024 * 1024)).toFixed(2));        
    };

    function sendRequest() {
        if (selectedFile) {
            const peer = new SimplePeer({ initiator: true, trickle: false });

            peer.on('signal', (data:any) => {
                console.log('signal!');
                
                socket.emit('send-request', {
                    sender: username,
                    receiver: name,
                    fileName: fileName,
                    fileSize: fileSize,
                    signalData: data,
                 });
                console.log('peer:', peer);
                setPeerRef(peer);
                
            });

            socket.on('send-response', (data:{signalData:SimplePeer.SignalData, status:number}) => {
                if (data.status === 200) {
                    sendFile(peer)
                        
                        
                } else {
                    console.log('other user rejected file transfer');
                    peer.destroy();
                }
            })

            
            
            

        }
    }

    function sendFile(peer: SimplePeer.Instance) {
        const stream = selectedFile!.stream();
        const reader = stream.getReader();

        reader.read().then(data => {
            handleReading(data.done, data.value!)
            console.log('data:', data.done, data.value);
        })

        function handleReading(done: boolean, value: Uint8Array) {
            if(done){
                peer.write(JSON.stringify({ done: true, fileName: fileName }));
            }

            peer.write(value);
            reader.read().then(data => handleReading(data.done, data.value!));
        }
    }

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

export default TransferFileModal;