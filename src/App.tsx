import { lazy, Suspense } from "react";
import { Navigate, Routes, Route } from "react-router";
import { X } from "lucide-react";
import { Toast, ToastClose, ToastDescription, ToastRegion, ToastTitle } from "@ui-sdk/react/toast";
import { Jim } from "./components/Jim";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const Workspace = lazy(() => import("./pages/Workspace"));

export default function App() {
  return (
    <>
      <Suspense fallback={<div className="app-loading"><Jim size="medium" mood="thinking" /><span>Opening Project Jimvis…</span></div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={<Workspace />} />
          <Route path="/app/library" element={<Workspace />} />
          <Route path="/app/report/:reportId" element={<Workspace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <ToastRegion className="toast-region" side="bottom" align="end">
        {() => (
          <Toast className="jim-toast">
            <div>
              <ToastTitle />
              <ToastDescription />
            </div>
            <ToastClose className="jim-toast__close" aria-label="Dismiss notification">
              <X size={14} />
            </ToastClose>
          </Toast>
        )}
      </ToastRegion>
    </>
  );
}
