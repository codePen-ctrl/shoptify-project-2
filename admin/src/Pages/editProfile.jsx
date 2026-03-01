import React, { useRef, useState } from "react"
import { AvatarPage } from "../components/Avatars";
import { Input } from "../components/Input"; 
import { LogOut, Mail, Phone, User, X } from "lucide-react";
import { Button } from "../components/Button";
import { useNavigate } from "react-router-dom";
import { useUserInfo } from "../hooks/useUserInfo";
import { useApi } from "../hooks/useApi";
import { AlertBox } from "../components/AlertBoxes";

export const EditPage = React.memo(() => {

    const [image, setImage] = useState(null);
    const username = useRef(null);
    const password = useRef(null);
    const phone = useRef(null);
    const email = useRef(null);
    const [state, setState] = useState('ready');
    const [error, setError] = useState(null);
    const navigator = useNavigate();
    const {Avatar, Id, Token, SetExpire} = useUserInfo();
    const [noti, setNoti] = useState(null);
    const {postAPI} = useApi();

    const imageReader = (e) => {
        const file = e.target.files[0];

        if (!file) {
            console.log("No file selected");
            return;
        }

        if (!file.type.startsWith("image/")) {
            console.log("Only image allowed");
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            setImage(reader.result);
            console.log(reader.result)
        };

        reader.readAsDataURL(file);
    };

    const handleUpdate = async()=>{
        setError(null);
        setState('loading');

        const data = await postAPI({
            endpoint: `/admin/changeInfo?token=${Token}`,
            body: {
                username: username.current || null,
                email: email.current || null,
                phone: phone.current || null,
                avatar: image || null,
                id: Id
            }
        })

        console.log(data);
        if(data.expired) SetExpire(data.expired);
        if(!data.success){
            setError(data.reason)
        }
        else{
            navigator('/dashboard') 
        }
        setState('ready');

    }

    const handleLogout = ()=>{
        localStorage.removeItem('POS');
        navigator('/auth/login')
    }

    return (
        <>
        {noti && <AlertBox type="error" title="Logout Alert" titleIcon={{icon: <LogOut size={18}/>}} description={`Are you sure to log out`} style={{
                            position: 'absolute',
                            zIndex: 100,
                            top: '100px'
                        }}>
                            <Button style={{height: '25px'}} variant="danger" onClick={handleLogout}>LogOut</Button>
                            <Button style={{height: '25px'}} variant="default" onClick={()=>setNoti(null)}>Cancle</Button>
                        </AlertBox>}
        <div className="edit_page">
            <Button onClick={()=>navigator('/dashboard')} onlyIcon={true} style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            padding: '3px'
                        }}>
                            <X size={16} strokeWidth={3}/>
                        </Button>
            <h1>Edit Profile</h1>
            <AvatarPage size="150px" image={image || Avatar} />
            
            <Input
                type="file"
                fileType="image/*"
                onChange={imageReader}
                size="sm"
                style={{ marginTop: '20px' }}
                label="Select Picture"
            />

            <Input 
                icon={<User size={16}/>}
                label="Username"
                placeholder="Enter new username"
                onChange={(value)=>username.current=value}
                style={{
                    marginTop: '20px'
                }}
                error={
                    error == ("username-null" || error == "username-invalid") && "Invalid username"
                }
            />

            <Input
                icon={<Mail size={16}/>}
                type="email"
                label="E-mail"
                placeholder="Enter new email"
                onChange={(value)=>email.current=value}
                style={{
                    marginTop: '25px'
                }}
                error={
                    error == "not-email" && "Invalid email" || 
                    error == "email-used" && "Email already used"
                }
            />

            <Input
                icon={<Phone size={16}/>}
                type="tel"
                label="Phone"
                placeholder="Enter new phone"
                onChange={(value)=>phone.current=value}
                style={{
                    marginTop: '25px'
                }}
                error={
                    error == "phone-null" && "Invalid phone number"
                }
            />

            <Button
                size="full"
                style={{
                    width: '100%',
                    height: '30px',
                    marginTop: '10px'
                }}
                loading={state == 'loading'}
                onClick={handleUpdate}
            >Update</Button>

            <div style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                marginTop: '10px'
            }}>
                <Button size="sm" onClick={()=>setNoti(true)}><LogOut size={12} strokeWidth={3}/> Logout</Button>
            </div>
        </div>
        </>
    );
});