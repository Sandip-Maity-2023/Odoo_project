export default function ProtectedRoute({ children, user = null, adminOnly = false }) {
  if (!user) return null;
  if (adminOnly && user.role !== 'Admin') return null;

  return children;
}
