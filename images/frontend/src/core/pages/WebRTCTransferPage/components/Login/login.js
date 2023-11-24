import { useState } from 'react';

function Login({ socket, setUsername ,setUsers , setErrorMessage }) {
    
    const [usernameInput, setUsernameInput] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("login");
        socket.emit('login', { name: usernameInput });
    };

    socket.on('login', (data) => {
        console.log(data);
        //if statuscode is 200, set username and clear possibel error message
        if (data.status === 200) {
            setUsername(usernameInput);
            setErrorMessage(undefined);
            setUsers(data.users);
        } else {
            //if statuscode is not 200, set and display error message
            setErrorMessage(data.message)
        }
    });

    


    return (
        <div>
            <h2>please enter your username</h2>
            
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Enter your name" onChange={(e) => setUsernameInput(e.target.value)} />
                <button type="submit">Submit</button>
            </form>

        </div>
    );
}

export default Login;