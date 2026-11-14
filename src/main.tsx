import "@/lib/logger";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/700.css";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import App from './App.tsx'

const routerBase = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={routerBase}>
      <TRPCProvider>
        <App />
      </TRPCProvider>
    </BrowserRouter>
  </StrictMode>,
)
