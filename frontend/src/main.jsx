import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './store';
import App from './App.jsx'
import ProtectedRoute from './components/protectedRoutes.jsx'

import RegisterScreen from './screens/registerScreen.jsx';
import LoginScreen from './screens/loginScreen.jsx';
import ForgotPasswordScreen from './screens/forgetPassword.jsx';
import  Homepage from './screens/homeScreen.jsx'; 


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* Default route */}
      <Route index={true} path='/' element={<LoginScreen/>} />
      
      {/* User routes */}
      <Route path="users">
        <Route path="RegisterScreen" element={<RegisterScreen />} />
        <Route path="LoginScreen" element={<LoginScreen />} />
        <Route path="ForgotPasswordScreen" element={<ForgotPasswordScreen />} />
        <Route path="Homepage" element={<ProtectedRoute><Homepage /></ProtectedRoute>}/>
      </Route>
    </Route>
  )
);


const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  </StrictMode>
);
