export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="p-8 text-center">
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
      </div>
    );
  }
  
  return (
    <div>
      {children}
    </div>
  );
}