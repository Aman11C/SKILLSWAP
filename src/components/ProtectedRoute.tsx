import { Navigate } from '../utils/navigate';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 font-mono">
          <div className="w-10 h-10 border-4 border-black border-t-transparent animate-spin" />
          <p className="text-sm font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
