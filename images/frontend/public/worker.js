/* eslint-disable no-restricted-globals */
let array = [];

self.addEventListener('message', (event) => {
    try {
        if (event.data === "download") {
            const blob = new Blob(array);
            self.postMessage(blob);
            array = [];
        } else {
            array.push(event.data);
        } 
    } catch (error) {
        console.log(error);
    }  
});