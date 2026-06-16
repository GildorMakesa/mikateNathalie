import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

export const SOCIALS = {
  // Facebook page provided as "Mikaté Royal" — direct search URL placeholder
  facebook: "https://www.facebook.com/people/Mikat%C3%A9-Royal/",
  instagram: "https://www.instagram.com/mikate_royal/",
  whatsapp: "https://wa.me/14380000000?text=Bonjour%20D%C3%A9lices%20Mikat%C3%A9%20Royal%20%21%20Je%20souhaite%20commander.",
  email: "mailto:mikateroyal@gmail.com",
};

export const formatCAD = (n) =>
  new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(n);
