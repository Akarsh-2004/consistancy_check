import React from 'react'
import ReactDOM from 'react-dom/client'
import './app/globals.css'
import App from './app/App.tsx'
import { loadState } from './app/lib/state.ts'

const initialState = loadState();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App initialState={initialState} />
    </React.StrictMode>,
)
