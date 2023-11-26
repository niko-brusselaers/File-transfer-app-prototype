import styles from './downloadLink.module.css';

function DownloadLink({downloadLink}:{downloadLink:string}) {

    return ( 
        <div className={styles.downloadContainer}>
                    <div>
                        <input type="text" value={downloadLink} disabled></input> 
                        <button className={styles.copyLinkButton} onClick={() => navigator.clipboard.writeText(downloadLink)}>copy</button>
                    </div>
                    <button className={styles.downloadButton} onClick={()=> window.location.href=downloadLink}>Download</button>
        </div>
     );
}

export default DownloadLink;