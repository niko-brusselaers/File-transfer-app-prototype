import { useEffect, useState } from 'react';
import axios from 'axios';

const backend_URL = 'http://localhost:4000';

function UploadPage() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [downloadLink, setDownloadLink] = useState(null);


    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    useEffect(() => {
    })

    const handleUpload = async () => {
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            await axios.post(`${backend_URL}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }).then((response) => {
                console.log(response.data);
                setDownloadLink(response.data.downloadUrl)
            });

            console.log('File uploaded successfully');
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };


    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            {downloadLink ? (
                <>
                    <div>
                        <p>{downloadLink}</p> <button onClick={() => navigator.clipboard.writeText(downloadLink)}>copy</button>
                    </div>
                    <a href={downloadLink} download>Download</a>
                </>) : null}
        </div>
    );
};

export default UploadPage;
