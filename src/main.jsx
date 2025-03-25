import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './public/css/index.css'
import GlobalEventProvider from './context/GlobalEventContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <GlobalEventProvider>
        <App />
      </GlobalEventProvider>
  </React.StrictMode>
)