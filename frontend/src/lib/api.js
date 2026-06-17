import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

export const SOCIALS = {
  facebook: "https://www.facebook.com/profile.php?id=61590862580694",
  instagram: "https://www.instagram.com/mikate_royal/",
  email: "mailto:contact@mikateroyal.com",
};

export const formatCAD = (n) =>
  new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(n);
