import { createContext, useContext, useEffect, useState } from "react";

const Context = createContext(null);

export default function ThemeContext({ children }) {

    const [Theme, setTheme] = useState(localStorage.getItem('webgenie-theme') || 'light');

    useEffect(()=>{
        if(!localStorage.getItem('webgenie-theme')){
            const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            localStorage.setItem('webgenie-theme', isDarkMode ? 'dark' : 'light');
        }
    },[])

    const ChangeTheme = ()=>{   
        localStorage.setItem('webgenie-theme', Theme == 'dark' ? 'light' : 'dark');
        setTheme(prep=>prep == 'dark' ? 'light' : 'dark');
    }

    useEffect(()=>{
        document.documentElement.setAttribute('data-theme', Theme == 'dark' ? 'dark' : 'light');
    },[Theme])

    return (
        <Context.Provider value={{
            Theme,
            ChangeTheme
         }}>
            {children}
        </Context.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(Context);
    if (!context) {
        throw new Error('useTheme must be used inside ThemeContext');
    }
    return context;
};
