import Cookies from "js-cookie";
import {jwtDecode} from "jwt-decode";
import axios from 'axios';
axios.defaults.withCredentials = true;

const apiPort = import.meta.env.VITE_API_PORT || 3000;
const apiUrl = `http://localhost:${apiPort}`;

// export const GetProductTypes = async () => {
//     const url = `${apiUrl}/masterData/productType`;
    
//     try {
//         const response = await axios.get(url);
//         console.log(`response.data`, response.data);
//         return response.data;
//     } catch (error) {
//         console.error('There has been a problem with your fetch operation:', error);
//         throw error; // Re-throw the error to handle it in the calling function
//     }
// };


export const GetProductTypes = async () => {
    const cacheKey = "productTypesCache";
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
        console.log("Using cached data");
        return JSON.parse(cachedData);
    }

    const url = `${apiUrl}/masterData/productType`;
    try {
        const response = await axios.get(url);
        localStorage.setItem(cacheKey, JSON.stringify(response.data)); // Cache the response
        console.log("Fetched from API:", response.data);
        return response.data;
    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
};
