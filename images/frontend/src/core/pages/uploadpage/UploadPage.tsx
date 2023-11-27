import { useEffect, useState } from 'react';
import styles from './UploadPage.module.css';
import axios from 'axios';
import DownloadLink from './components/downloadLink';

const BACKEND_URL = "localhost"
const backend_Express = `http://${BACKEND_URL}:4000`;

function UploadPage() {
    const [selectedFile, setSelectedFile] = useState<Blob|null>(null);
    const [downloadLink, setDownloadLink] = useState(null);


    const handleFileChange = (event:any ) => {
        setSelectedFile(event.target.files[0]);
    };

    useEffect(() => {
    })

    const handleUpload = async () => {
        //check if file is selected
        if (!selectedFile) return;
        //upload file to backend server
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            await axios.post(`${backend_Express}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }).then((response) => {
                console.log(response.data);
                setDownloadLink(response.data.downloadUrl)
            });

            console.log('File uploaded successfully');
        } catch (error) {
            // console.log(error);
            console.error('Error uploading file:', error);
        }
    };


    return (
        <div className={styles.uploadPageContainer}>
            <div className={styles.fileInputContainer}>
                <p>Please select or drag a file to send</p>
                <input type="file" onChange={handleFileChange} />
            </div>
            <button onClick={handleUpload} disabled={selectedFile ? false : true}>Upload</button>
            {downloadLink ? (
                <DownloadLink downloadLink={downloadLink} />
                ) : null}
        </div>
    );
};

export default UploadPage;
