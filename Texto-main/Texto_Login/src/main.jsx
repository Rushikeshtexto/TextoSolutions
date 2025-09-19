import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import {GoogleOAuthProvider} from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

const CLIENT_ID = "338084496803-gvkbl9ga37l6uu4hkr7akmpr4fev5np8.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider  clientId={CLIENT_ID}>
    <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
