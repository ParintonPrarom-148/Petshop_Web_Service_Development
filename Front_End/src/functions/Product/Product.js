import Cookies from "js-cookie";
import {jwtDecode} from "jwt-decode";
import axios from 'axios';
axios.defaults.withCredentials = true;

const apiPort = import.meta.env.VITE_API_PORT || 3000;
const apiUrl = `http://localhost:${apiPort}`;

export const GetProducts = async (data) => {
    const cacheKey = "productsCache";
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
        console.log("Using cached data");
        return JSON.parse(cachedData);
    }
    const url = `${apiUrl}/getProducts`;
    const token = Cookies.get('token');
    try {
        console.log(data);
        const response = await axios.post(url, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        localStorage.setItem(cacheKey, JSON.stringify(response.data)); // Cache the response
        console.log("Fetched from API:", response.data);
        return response.data;
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        throw error; // Re-throw the error to handle it in the calling function
    }
}

export const AddProduct = async (data) => {
    const url = `${apiUrl}/addProducts`;
    const token = Cookies.get('token');
    console.log(token);
    try {
        console.log(data);
        const response = await axios.post(url, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        if(response.status === 200){
            localStorage.removeItem("productsCache");
        }
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        throw error; // Re-throw the error to handle it in the calling function
    }
}

export const UpdateProduct = async (data) => {
    const url = `${apiUrl}/updateProducts`;
    const token = Cookies.get('token');
    console.log(token);
    try {
        console.log(data);
        const response = await axios.post(url, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        

        if(response.data.status === 200){
            console.log(`Removed cache`);
            localStorage.removeItem("productsCache");
        }
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        throw error; // Re-throw the error to handle it in the calling function
    }
}

export const DelProduct = async (data) => {
    const url = `${apiUrl}/delProducts`;
    const token = Cookies.get('token');
    console.log(token);
    try {
        console.log(data);
        const response = await axios.post(url, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        
        console.log(`response.data`, response.data);
        if(response.data.status === 200){
            console.log(`Removed cache`);
            localStorage.removeItem("productsCache");
        }
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        throw error; // Re-throw the error to handle it in the calling function
    }
}