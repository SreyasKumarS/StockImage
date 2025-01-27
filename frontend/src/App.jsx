import React from 'react';
import { Outlet } from 'react-router-dom';  
import { ToastContainer } from 'react-toastify';
import Header from './components/header';
import Footer from './components/footer';

function App() {
 
  return (
<div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header at the top */}
      <Header />

      {/* ToastContainer for global notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      {/* Main content section */}
      <div style={{ flex: 1 }}>
        <Outlet /> {/* Render nested routes dynamically */}
      </div>

      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
};

export default App
