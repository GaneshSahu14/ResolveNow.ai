import { Navigate, Outlet } from "react-router";
import { useSession } from "../lib/auth-client";

export default function ProtectedRoute() {
  const { data: session, isPending } = useSession();

  console.log("ProtectedRoute render: isPending=", isPending, "session=", session ? session.user.email : "null");

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!session) {
    console.log("ProtectedRoute: No session, redirecting to /login");
    // If the session cookie is present but /api/me or session validation fails
    // due to 401, keep the user on the login page with a visible prompt.
    return <Navigate to="/login" replace />;
  }


  return <Outlet />;
}
