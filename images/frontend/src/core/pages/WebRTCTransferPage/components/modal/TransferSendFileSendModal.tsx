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

    function sendRequest() {
        if (selectedFile) {
            const peer = new SimplePeer({ initiator: true, trickle: false });

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

            peer.on('error', (error) => {console.error(error)} );

            peer.on('end', (error:any) => {console.error("closing")} );


            socket.on('send-response', (data:{signal:SimplePeer.SignalData, status:number}) => {                
                if (data.status === 200) {
                    try {                        
                        peer.signal(data.signal);
                            sendFile(peer);
                            
                    } catch (error) {
                        console.log(error);
                        
                    }
                    
                     
                } else {
                    console.log('other user rejected file transfer');

                }
            })

            
            
            

        }
    }

    function sendFile(peer:SimplePeer.Instance) {
        if (!selectedFile) return;
        const stream = selectedFile.stream();
        const reader = stream.getReader();

        reader.read().then((obj:any) => {
            handlereading(obj.done, obj.value);
        });

        function handlereading(done:any, value:any) {
            if (done) {
                peer.write(JSON.stringify({ done: true, fileName: fileName }));
                return;
            }
            
            peer.write(value);
                reader.read().then((obj: any) => {
                    handlereading(obj.done, obj.value);
                });
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

export default TransferSendFileModal;