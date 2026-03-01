import { useState } from "react";
import { createContext, useContext } from "react";

const Context = createContext(null);

export default function UserInfoContext({ children }) {

    const [Id, SetId] = useState('');
    const [Username, SetUsername] = useState('');
    const [Email, SetEmail] = useState('');
    const [Expire, SetExpire] = useState(true);
    const [Token, SetToken] = useState(null);
    const [Avatar, SetAvatar] = useState(null);
    const [Phone, SetPhone] = useState(null)

    return (
        <Context.Provider value={{
            Id,
            Username,
            Email,
            Expire,
            Avatar,
            Token,
            Phone,

            SetId,
            SetUsername,
            SetEmail,
            SetExpire,
            SetAvatar,
            SetToken,
            SetPhone
        }}>
            {children}
        </Context.Provider>
    );
}

export const useUserInfo = () => {
    const context = useContext(Context);
    if (!context) {
        throw new Error('useUserInfo must be used inside UserInfoContext');
    }
    return context;
};