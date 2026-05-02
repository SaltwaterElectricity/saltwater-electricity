import { useNavigate } from 'react-router-dom';
 
export const NotFoundPage = () => {
  const navigate = useNavigate();
 
  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column', 
      alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f2f5'
    }}>
      <h1 style={{ fontSize: '100px', margin: 0, color: '#1a73e8' }}>404</h1>
      <h2 style={{ marginBottom: '20px' }}>Oops! Page Not Found</h2>
      <p style={{ color: '#5f6368', marginBottom: '30px' }}>
        The page you are looking for might have been removed or had its name changed.
      </p>
      <button 
        onClick={() => navigate('/')}
        style={{
          padding: '10px 25px', backgroundColor: '#1a73e8', color: 'white',
          border: 'none', borderRadius: '5px', cursor: 'pointer'
        }}
      >
        Back to Safety
      </button>
    </div>
  );
};