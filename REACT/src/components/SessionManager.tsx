import React, { useState, useEffect } from "react";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

export const SessionManager: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useSessionTimeout();
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const navigate = useNavigate();
  const timeoutMinutesRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if user is logged in at mount
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    // Show warning at 55 minutes
    const warningTime = 55 * 60 * 1000;
    timeoutMinutesRef.current = setTimeout(() => {
      setShowSessionWarning(true);
    }, warningTime);

    return () => {
      if (timeoutMinutesRef.current) {
        clearTimeout(timeoutMinutesRef.current);
      }
    };
  }, [navigate]);

  const handleContinueSession = () => {
    setShowSessionWarning(false);
  };

  const handleLogout = async () => {
    // Record logout in DB before clearing state
    try {
      const token = localStorage.getItem("access_token");
      const sessionId = localStorage.getItem("session_id");
      if (token) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL ?? "http://127.0.0.1:8000"}/api/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ session_id: sessionId ? parseInt(sessionId) : null }),
        });
      }
    } catch (e) {
      console.warn("Session timeout logout call failed:", e);
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("session_id");
    navigate("/login", { replace: true });
  };

  return (
    <>
      {children}
      <AlertDialog open={showSessionWarning} onOpenChange={setShowSessionWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Session Timeout Warning</AlertDialogTitle>
            <AlertDialogDescription>
              Your session will expire in 5 minutes due to inactivity. Would you like to continue working?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-4 justify-end">
            <AlertDialogCancel onClick={handleLogout}>
              Logout
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleContinueSession}>
              Continue Working
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
