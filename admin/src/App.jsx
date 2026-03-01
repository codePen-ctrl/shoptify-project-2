import { Route, Routes, useNavigate } from "react-router-dom";
import {Button} from "./components/Button";
import { ForgetPasswordPage, LoginPage, PasswordRecoveryPage } from "./Pages/auth";
import { useEffect } from "react";
import { useUserInfo } from "./hooks/useUserInfo";
import { Dashboard } from "./Pages/dashboard";
import { useApi } from "./hooks/useApi";
import { AddUserPage } from "./Pages/addUser";
import { AddAdminPage } from "./Pages/addAdmin";
import { EditPage } from "./Pages/editProfile";

function App() {
  // const [count, setCount] = useState(0)
  const navigator = useNavigate();
  const {Expire} = useUserInfo();
  const {postAPI} = useApi();
  const {SetId,
              SetUsername,
              SetEmail,
              SetExpire,
              SetAvatar,
              SetToken,
              SetPhone} = useUserInfo();

  useEffect(()=>{
    const theme = localStorage.getItem('webgenie-theme');
    if(!theme){
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      localStorage.setItem('webgenie-theme', isDarkMode ? 'dark' : 'light');
      if(isDarkMode){
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    }
    else{
      document.documentElement.setAttribute('data-theme', theme == 'dark' ? 'dark' : 'light');
    }

    const fetchData = async()=>{
      const data = await postAPI({
        endpoint: '/admin/checktoken',
        body: {
          token: localStorage.getItem('POS') || null
        }
      })

      console.log(data);

      SetId(data.user.id);
      SetUsername(data.user.username);
      SetEmail(data.user.email);
      SetExpire(data.expired);
      SetAvatar(data.user.avatar);
      SetToken(localStorage.getItem('POS') || null);
      SetPhone(data.user.phone);
    }
    fetchData()
  },[])

  useEffect(()=>{
    Expire ? navigator('/auth/login') : navigator('/dashboard');
  },[Expire])

  return (
    <Routes>
      <Route path="/auth/login" element={<LoginPage/>}/>
      <Route path="/auth/forgetPassword" element={<ForgetPasswordPage/>}/>
      <Route path="/auth/passwordRecovery" element={<PasswordRecoveryPage/>}/>
      <Route path="/dashboard" element={<Dashboard/>}/>
      <Route path="/addUser" element={<AddUserPage/>}/>
      <Route path="/addAdmin" element={<AddAdminPage/>}/>
      <Route path="/editProfile" element={<EditPage/>}/>
      
    </Routes>
  )
}

export default App
