import { AuthProvider, useAuth } from "./context/AuthContext";
import Feed from "./components/Feed";
import AuthCard from "./components/AuthCard";

function AppContent() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Feed /> : <AuthCard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
