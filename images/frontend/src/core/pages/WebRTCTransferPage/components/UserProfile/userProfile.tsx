import styles from './userProfile.module.css';

function UserProfile({name, sendFileRequest}: {name: string, sendFileRequest: Function}) {
    return ( 
        <div className={styles.userProfileContainer}>
            <h1>{name}</h1>
            <button onClick={()=>sendFileRequest(name)}>send file</button>
        </div>
     );
}

export default UserProfile;