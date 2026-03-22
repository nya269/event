import axios from "axios";

const apiClient = axios.create({
  // Utilise l'IP que l'on voit sur ta capture d'écran
  baseURL: "http://192.0.0.3:4000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
