import Cookies from "js-cookie";
import { EventBus } from "../../event-bus";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
axios.defaults.withCredentials = true;

const apiPort = import.meta.env.VITE_API_PORT || 3000;
const apiUrl = `http://localhost:${apiPort}`;

export const getCart = async (data) => {
  const url = `${apiUrl}/carts/getcart`;

  try {
    console.log(data);
    const response = await axios.get(url, data);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

export const chkcart = async (data) => {
  const url = `${apiUrl}/carts/chkcart`;
  const token = Cookies.get("token");
  console.log(token);
  try {
    console.log(data);
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`response.data`, response.data);
    if (response.status === 200) {
    }
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

export const addcart = async (data) => {
  const url = `${apiUrl}/carts/addcart`;
  const token = Cookies.get("token");
  console.log(token);
  try {
    console.log(data);
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`response.data`, response.data);
    if (response.status === 200) {
    }
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

export const addcartdtl = async (data) => {
  const url = `${apiUrl}/carts/addcartdtl`;
  const token = Cookies.get("token");
  console.log(token);
  try {
    console.log(data);
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`response.data`, response.data);
    console.log(`response.data.status`, response.status);
    if (response.status === 200) {
      localStorage.removeItem("cartDetails");
      EventBus.emit("updated-cart");

      console.log(`Removed cartDetails from localStorage`);
    }
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

export const getCartDtl = async (data) => {
  const url = `${apiUrl}/carts/getcartbycus`;
  const token = Cookies.get("token");
  console.log(token);
  try {
    console.log(data);
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`response.data`, response.data);
    if (response.data.status === 200) {
      console.log(`Setting cartDetails in localStorage`);
      localStorage.setItem("cartDetails", JSON.stringify(response.data.data));
    }
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

export const getCartHistoryDtl = async (data) => {
  const url = `${apiUrl}/carts/getcarthistorybycus`;
  const token = Cookies.get("token");
  console.log(token);
  try {
    console.log(data);
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`response.data`, response.data);
    if (response.data.status === 200) {
      localStorage.setItem(
        "cartHistoryDetails",
        JSON.stringify(response.data.data)
      );
    }
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

export const updateCartItemQty = async (data) => {
  const url = `${apiUrl}/carts/updateCartItemQty`;
  const token = Cookies.get("token");
  console.log(token);
  try {
    console.log(data);
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`response.data`, response.data);
    if (response.data.status === 200) {
      localStorage.removeItem("cartDetails");
      EventBus.emit("updated-cart");
    }
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

export const delCartItem = async (data) => {
  const url = `${apiUrl}/carts/delCartItem`;
  const token = Cookies.get("token");
  console.log(token);
  try {
    console.log(data);
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`response.data`, response.data);
    if (response.data.status === 200) {
      localStorage.removeItem("cartDetails");
      EventBus.emit("updated-cart");
    }
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

export const delCart = async (data) => {
  const url = `${apiUrl}/carts/delCart`;
  const token = Cookies.get("token");
  console.log(token);
  try {
    console.log(data);
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`response.data`, response.data);
    if (response.data.status === 200) {
      localStorage.removeItem("cartDetails");
      EventBus.emit("updated-cart");
    }
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

export const confirmCart = async (data) => {
  const url = `${apiUrl}/carts/confirmCart`;
  const token = Cookies.get("token");
  console.log(token);
  try {
    console.log(data);
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`response.data`, response.data);
    if (response.data.status === 200) {
      localStorage.removeItem("cartDetails");
      localStorage.removeItem("cartHistoryDetails");
      EventBus.emit("updated-cart");
    }
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};
