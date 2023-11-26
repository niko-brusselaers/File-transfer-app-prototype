import { useEffect, useState } from 'react';
import styles from './TransferFileModal.module.css';
import "./TransferFileModal.module.css"
import { Socket } from 'socket.io-client';


function TransferFileModal({ModalIsOpen,socket,name}: {ModalIsOpen: Function,socket:Socket,name:string|undefined}  ) {
    const [selectedFile, setSelectedFile] = useState<Blob|null>(null);
    const [fileName, setFileName] = useState<string|undefined>(undefined);
    const [fileSize, setFileSize] = useState<string|undefined>(undefined);

    function handleFileChange(event:any ) {
        setSelectedFile(event.target.files[0]);
        setFileName(event.target.files[0].name);
        setFileSize((event.target.files[0].size / (1024 * 1024)).toFixed(2));        
    };

    function sendRequest() {}

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