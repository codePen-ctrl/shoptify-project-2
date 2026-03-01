import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom";
import ApiContext from './hooks/useApi.jsx';
import UserInfoContext from './hooks/useUserInfo.jsx';
import ThemeContext from './hooks/useTheme.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ApiContext>
        <UserInfoContext>
          <ThemeContext>
            <App />
          </ThemeContext>
        </UserInfoContext>
      </ApiContext>
    </BrowserRouter>
  </StrictMode>
)
