import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { ApiSettings } from './pages/ApiSettings';
import { Verify } from './pages/Verify';
import { VerifyUrl } from './pages/VerifyUrl';
import { Article } from './pages/Article';

function App() {
  const [category, setCategory] = useState("top stories");

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout setCategory={setCategory} />}>
            <Route index element={<Home category={category} />} />
            <Route path="auth" element={<Auth />} />
            <Route path="api-settings" element={<ApiSettings />} />
            <Route path="verify" element={<Verify />} />
            <Route path="verify-url" element={<VerifyUrl />} />
            <Route path="article" element={<Article />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;