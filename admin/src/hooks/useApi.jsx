import { createContext, useContext } from "react";

const Context = createContext(null);

export default function ApiContext({ children }) {

    const BASE_URL = 'http://192.168.100.4:3000';

    const getAPI = async ({ endpoint, type = "json"}) => {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`);

            return type === "json"
                ? await response.json()
                : await response.text();

        } catch (error) {
            console.error("GET API Error:", error.message);
            throw error;
        }
    };

    const postAPI = async ({ endpoint, body = {}, type = "json"}) => {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body)
            });

            return type === "json"
                ? await response.json()
                : await response.text();

        } catch (error) {
            console.error("POST API Error:", error.message);
            throw error;
        }
    };

    return (
        <Context.Provider value={{ BASE_URL, getAPI, postAPI }}>
            {children}
        </Context.Provider>
    );
}

export const useApi = () => {
    const context = useContext(Context);
    if (!context) {
        throw new Error("useApi must be used inside ApiContext");
    }
    return context;
};