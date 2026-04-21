import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
    const { user } = useAuth();
    // check if admin
    const adminUsers: Array<string> = import.meta.env.VITE_ADMIN_USERS ?? ["xxxxxxxx-xxxx-4xxx-axxx-xxxxxxxxxxxx"]
    if (!adminUsers.includes(user.uuid)) {
        return <h1>Not Authorized</h1>
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted">
        <p>Hello World</p>
        </div>
    );
};

export default NotFound;
