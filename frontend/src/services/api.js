import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api"
});

export const getTransactions = async () => {
    const response = await API.get("/transactions/");
    return response.data;
};

export default API;