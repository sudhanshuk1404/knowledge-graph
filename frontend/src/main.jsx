import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import Dashboard from './dashboard/Dashboard.jsx'
import SchemaEditorTool from './Tools/SchemaEditor/SchemaEditorTool.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import Login from './auth/Login.jsx'
import TestView from './customerview/TestView.jsx'
import KnowledgeGraphTool from './Tools/KnowledgeGraph/KnowledgeGraphTool.jsx'


const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/tool/knowledgegraph" element={
              <ProtectedRoute>
                <KnowledgeGraphTool />
              </ProtectedRoute>
            } />
            <Route path="/tool/schema-editor" element={
              <ProtectedRoute>
                <SchemaEditorTool />
              </ProtectedRoute>
            } />
            <Route path="/tool/customer-dashboard" element={
              <ProtectedRoute>
                <TestView/>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
)
