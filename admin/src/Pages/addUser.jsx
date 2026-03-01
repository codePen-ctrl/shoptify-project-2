import React, { useEffect, useRef, useState } from "react";
import { Input, TextField } from "../components/Input";
import { Lock, Mail, Phone, User, X } from "lucide-react";
import { Button } from "../components/Button";
import { useNavigate } from "react-router-dom";
import { isEmail } from "../library/helpers";
import { useApi } from "../hooks/useApi";
import { useUserInfo } from "../hooks/useUserInfo";
import { AlertBox } from "../components/AlertBoxes";

export const AddUserPage = React.memo(()=>{
    const [state, setState] = useState('ready');
    const navigator = useNavigate();
    const username = useRef(null);
    const password = useRef(null);
    const email = useRef(null);
    const phone = useRef(null);
    const location = useRef(null);
    const [error, setError] = useState(null);
    const {postAPI} = useApi();
    const {Token, SetExpire} = useUserInfo();
    const [noti, setNoti] = useState(null);

    const handleCreate = async()=>{
        setError(null)
        if(!username.current) return setError('username-null');
        if(!password.current) return setError('password-null');
        if(password.current.length < 8) return setError('password-weak');   
        if(!email.current) return setError('email-null');
        if(!isEmail(email.current)) return setError('not-email');
        if(!phone.current) return setError('phone-null');
        if(!location.current) return setError('location-null');
                
        setState('loading');

        const data = await postAPI({
            endpoint: `/admin/createUser?token=${Token}`,
            body: {
                username: username.current,
                password: password.current,
                email: email.current,
                phone: phone.current,
                location: location.current
            }
        })

        console.log(data);
        if(data.expired) SetExpire(data.expired);

        if(!data.success) setError(data.reason);
        else{
            setNoti({
                username: username.current,
            })
        }

        setState('ready');
        
    }

    useEffect(()=>{
        if(!noti) return;

        const timer = setTimeout(()=>{
            setNoti(null);
        },3000)

        return ()=>clearTimeout(timer)
    },[noti])

    return  <>  {noti && <AlertBox setHeight="50px" type="success" title="Create Successful" description={`${noti.username} created successful.`} style={{
                    position: 'absolute',
                    zIndex: 100,
                    top: '100px'
                }}>
                    <Button size="full" style={{height: '25px'}} variant="success" onClick={()=>setNoti(null)}>Ok</Button>
                </AlertBox>}
                <div className="add_card">
                        <Button onClick={()=>navigator('/dashboard')} onlyIcon={true} style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            padding: '3px'
                        }}>
                            <X size={16} strokeWidth={3}/>
                        </Button>
                        <h1>Add User</h1>
                        <Input maxLength={150} label="Username" icon={<User size={18}/>} placeholder="Enter username" style={{marginTop: '10px'}} onChange={(value)=>username.current = value} error={
                            error == "username-null" && "Must fill username" ||
                            error == "username-invalid" && "Invalid username"
                        }/>
                        <Input maxLength={50} label="Password" type="password" icon={<Lock size={18}/>} placeholder="Enter password" style={{marginTop: '25px'}} onChange={(value)=>password.current = value} error={
                            error == "password-null" && "Must fill password" ||
                            error == "password-weak" && "Password not strong"
                        }/>
                        <Input label="E-mail" type="email" icon={<Mail size={18}/>} placeholder="Enter email" style={{marginTop: '25px'}} onChange={(value)=>email.current = value} error={
                            error == "email-null" && "Must fill email" ||
                            error == "not-email" && "Invalid email format" ||
                            error == "email-used" && "Email already used"}
                        />
                        <Input label="Phone" type="tel" icon={<Phone size={18}/>} placeholder="Enter phone number" style={{marginTop: '25px'}} onChange={(value)=>phone.current = value} error={
                            error == "phone-null" && "Must fill phone number"
                        }/>
                        <TextField setResize={false} style={{marginTop: '25px'}} label="Location" placeholder="Enter shop location" setHeight="60px" onChange={(value)=>location.current = value} error={
                            error == "location-null" && "Must fill shop location"
                        }/>
                        <Button size="full" style={{marginTop: '20px'}} loading={state === "loading"} onClick={handleCreate}>Create</Button>
                </div>
            </>
})