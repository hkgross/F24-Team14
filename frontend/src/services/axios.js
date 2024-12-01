import axios from "axios";

//use hostname to prevent from having to change the ip address between local and deployment
var hostname=window.location.hostname;

const axiosInstance = axios.create({
    // Deployment
    baseURL: 'http://'+hostname+':8000/',//52.44.88.150:8000/',
    headers: {
        'Content-Type': 'application/json',
    }
});

export default axiosInstance;