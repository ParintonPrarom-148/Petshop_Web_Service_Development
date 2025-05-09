import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode"; // Correct the import statement

export const getCookie = () => {
  const token = Cookies.get("token");
  console.log(`token: ${token}`);
  if (token) {
    try {
      const decoded = jwtDecode(token); // Use the default export
      return decoded;
    } catch (error) {
      console.error("Invalid token", error);
      return null;
    }
  }
  return null;
};
