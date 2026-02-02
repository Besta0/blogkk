import React from 'react'
import ReactDOM from 'react-dom/client'
import AdminDashboard from './admin'
import { QueryProvider } from './providers'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryProvider>
      <AdminDashboard />
    </QueryProvider>
  </React.StrictMode>,
)
