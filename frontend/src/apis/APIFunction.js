import axios from 'axios'
var TOKEN = ""

const instance = axios.create({
    baseURL: "",
    headers: { 'token': TOKEN }
});


// Function to set the token in both localStorage and the Axios instance
function setToken(newToken) {
    TOKEN = newToken;
    localStorage.setItem('token', newToken);
    instance.defaults.headers['token'] = newToken;
}

// Initially check if a token exists in localStorage
const storedToken = localStorage.getItem('token');
if (storedToken) {
    setToken(storedToken);
}

// Get Request
const getRequest = (path) => {
    return instance.get(path);
}

// Post Request
const postRequest = (path, data) => {
    return instance.post(path, data);
}

// Delete Request
const deleteRequest = (path) => {
    return instance.delete(path);
}

export { getRequest, postRequest,  deleteRequest, setToken }




