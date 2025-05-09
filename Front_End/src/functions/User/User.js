import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
axios.defaults.withCredentials = true;

const apiPort = import.meta.env.VITE_API_PORT || 3000;
const apiUrl = `http://localhost:${apiPort}`;

export const Login = async (data) => {
  const url = `${apiUrl}/members/login`;

  try {
    console.log(data);
    const response = await axios.post(url, data);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

export const Register = async (data) => {
  const url = `${apiUrl}/members`;

  try {
    console.log(data);
    const response = await axios.post(url, data);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

export const Logout = async () => {
  const url = `${apiUrl}/members/logout`;

  try {
    const response = await axios.get(url);
    console.log(response.data);

    if (!response.data.login) {
      Cookies.remove("token");
      localStorage.clear();
      window.location.reload();
    }

    return response.data;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

export const UpdateUser = async (data) => {
  const url = `${apiUrl}/members/updateUser`;
  const token = Cookies.get("token");
  try {
    console.log(data);
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

export const UpdatePassword = async (data) => {
  const url = `${apiUrl}/members/updatePassword`;
  const token = Cookies.get("token");
  try {
    if (!token) {
      console.error("No authentication token found.");
      throw new Error("Unauthorized: No token found.");
    }
    console.log(data);
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};
