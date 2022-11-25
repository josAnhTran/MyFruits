import axios from "axios";
import { WEB_SERVER_URL } from "../functions/constants.js";

//Config axios
const axiosClient = axios.create({
  baseURL: WEB_SERVER_URL,
  timeout: 1000,
  headers: {
    "Content-Type": "application/json",
  },
});

// axiosClient.setToken = (token) => {
//   // axiosClient.defaults.headers["Authorization"] = `Bearer ${token}`;
//   window.localStorage.setItem("token", token);
// };
//
axiosClient.interceptors.request.use((request) => {
  console.log("request:", request);
  const token = window.localStorage.getItem("token");
  if (token) {
    request.headers["Authorization"] = `Bearer ${token}`;
  }
  return request;
});
//

// Response parse
axiosClient.interceptors.response.use(
  (response) => {
    const { token } = response.data;
    // if login
    if (token) {
      // axiosClient.setToken(token);
  window.localStorage.setItem("token", token);
    }
    return response;
  },
  (error) => {
    console.log(error)
    if ( error.response?.status=== 401) {
      // console.log("please login before request");
      //  WINDOW.LOCATION -- CHUYEN TOI ROUTE LOGIN
      window.location.assign("/login")
      //
        error.response.config.headers["Authorization"] =
          "Bearer " + window.localStorage.getItem("token");
        return axiosClient(error.response.config);
        // return axios(error.response.config);
    }
    
    if(error.response?.status=== 403){
       // console.log("For bidden");
      //  WINDOW.LOCATION -- CHUYEN TOI ROUTE LOGIN
      window.location.assign("/")
       //
       error.response.config.headers["Authorization"] =
       "Bearer " + window.localStorage.getItem("token");
     return axiosClient(error.response.config);
     // return axios(error.response.config);
    }

    console.warn("Error status", error.response?.status);
    return Promise.reject(error);
  }
);

export default axiosClient;
