import React, { useRef, useState } from "react"
import { Input, OtpInput } from "../components/Input"
import { Button } from "../components/Button"
import { useNavigate } from "react-router-dom"
import { MoveLeft } from "lucide-react"
import {isEmail} from "../library/helpers"
import { useApi } from "../hooks/useApi"
import { useUserInfo } from "../hooks/useUserInfo"

export const LoginPage = React.memo(()=>{
    const navigate = useNavigate();
    const email = useRef(null);
    const password = useRef(null);
    const [error, setError] = useState(null);
    const [state, setState] = useState('ready');
    const {BASE_URL, postAPI} = useApi();
    const {SetId,
            SetUsername,
            SetEmail,
            SetExpire,
            SetAvatar,
            SetToken,
            SetPhone} = useUserInfo();

    const handleLogin = async ()=>{
        setError(null)
        if(!email.current) return setError('email-null');
        if(!isEmail(email.current)) return setError('not-email');
        if(!password.current) return setError('password-null');
        
        setState('loading');
        const fetchData = async ()=>{
            try{
                const data = await postAPI({
                    endpoint: "/admin/login",
                    body: {
                        email: email.current,
                        password: password.current
                    }
                })
                console.log(data)

                if(!data.success){
                    setError(data.reason);
                }
                else{
                    SetId(data.user.id);
                    SetUsername(data.user.username);
                    SetEmail(data.user.email);
                    SetToken(data.token);
                    SetPhone(data.phone);
                    localStorage.setItem('POS', data.token);
                    SetExpire(data.expired);
                    SetAvatar(data.user.avatar);
                    navigate('/dashboard')
                }

                setState('ready')
            }
            catch (err) {
                console.log("Error:", err.message);
            }
        }
        fetchData()
    }

    return <div className="auth_card">
             <h1>Welcome Back</h1>
             <Input onChange={(value)=>email.current = value} type="email" placeholder="Enter e-mail..." label="E-mail" style={{marginTop: '10px'}} iconSize={15} error={
                error == "email-null" && "Must fill email" ||
                error == "not-email" && "Invalid email format" ||
                error == "email-not-found" && "Email not found"
             }/>
             <Input onChange={(value)=>password.current = value} type="password" placeholder="Enter password..." label="Password" style={{marginTop: '30px'}} iconSize={15} error={
                error == "password-null" && "Must fill password" ||
                error == "incorrect-password" && "Incorrect password"
            }/>
             <Button size="full" style={{marginTop: '25px', height: '35px', width: '100%'}} onClick={handleLogin} loading={state == 'loading'}>Enter</Button>
             <Button variant="link" size="sm" style={{marginTop: '5px'}} onClick={()=>navigate('/auth/forgetPassword')}>Forget Password ?</Button>
           </div>
})

export const ForgetPasswordPage = React.memo(()=>{
    const email = useRef(null);
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [state, setState] = useState('ready');
    const {postAPI} = useApi();
    const {SetEmail} = useUserInfo();

    const handleForgetPassword = async ()=>{
        setError(null);
        if(!email.current) return setError('email-null');
        if(!isEmail(email.current)) return setError('not-email');
        setState('loading');

        const data = await postAPI({
            endpoint: '/admin/sendOtp',
            body: {email: email.current}
        })

        console.log(data);

        if(data.success){
            SetEmail(email.current);
            navigate('/auth/passwordRecovery')
        }
        else{
            setError(data.reason)
        }
        setState('ready')
    }

    return <div className="auth_card">
            <Button onClick={()=>navigate('/auth/login')} onlyIcon={true} style={{position: 'absolute', top: '10px', left: '10px'}}><MoveLeft size={15} strokeWidth={4}/></Button>
            <h1>Forget Password</h1>
            <span className="msg">Enter your email and wait until <br/> we sent otp code to your e-mail</span>
            <Input onChange={(value)=>email.current = value} type="email" placeholder="Enter e-mail..." label="E-mail" style={{marginTop: '10px'}} iconSize={15} error={
                error == "email-null" && "Must fill email" ||
                error == "not-email" && "Invalid email format" ||
                error == "email-not-found" && "Email not found"
            }/>
            <Button onClick={handleForgetPassword} size="full" style={{width: '100%', height: '30px', marginTop: '20px'}} loading={state == 'loading'}>Sent OTP</Button>
           </div>
})

export const PasswordRecoveryPage = React.memo(()=>{
    const navigate = useNavigate();
    const password = useRef(null);
    const otpCode = useRef(null);
    const [error, setError] = useState(null);
    const [state, setState] = useState('ready');
    const otpLength = 6;
    const {postAPI} = useApi();
    const {Email} = useUserInfo();

    const handleRecovery = async ()=>{
        setError(null);
        if(!password.current) return setError('password-null');
        if(password.current.length < 8) return setError('password-weak');
        if(otpCode.current.length < otpLength) return setError('otp-null');

        setState('loading');
        
        const data = await postAPI({
            endpoint: '/admin/passwordRecovery',
            body: {
                email: Email,
                otp: otpCode.current,
                newPassword: password.current
            }
        })

        console.log(data);

        if(!data.success){
            setError(data.reason)
        }
        else{
            navigate("/auth/login")
        }

    }

    return <div className="auth_card">
            <Button onClick={()=>navigate('/auth/forgetPassword')} onlyIcon={true} style={{position: 'absolute', top: '10px', left: '10px'}}><MoveLeft size={15} strokeWidth={4}/></Button>
            <h1>Password Recovery</h1>
            <span className="msg">Enter new password, otp code for <br/> password recovery</span>
            <Input onChange={(value)=>password.current = value} type="password" placeholder="Enter new password..." label="New Password" style={{marginTop: '30px'}} iconSize={15} error={
                error == "password-null" && "Must fill new password" ||
                error == "password-weak" && "Password not strong" 
            }/>
            <OtpInput onChange={(value)=>otpCode.current = value} label="OTP code" digitAmt={otpLength} placeholder="?" style={{marginTop: '30px'}} error={
                error == "otp-null" && "Enter otp code first" ||
                error == 'invalid-otp' && "Invalid code" ||
                error == "otp-expired" && "Otp code expired"
            }/>
            <Button onClick={handleRecovery} size="full" style={{width: '100%', height: '30px', marginTop: '20px'}} loading={state == 'loading'}>Sent</Button>
            <Button variant="link" size="sm" style={{marginTop: '5px'}} onClick={()=>navigate('/auth/login')}>Remember Password?</Button>
           </div>
})