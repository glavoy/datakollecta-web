import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Database } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (accessToken && refreshToken) {
          // Set the session with the tokens
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error);
            setError(error.message);
            return;
          }

          // Redirect based on type
          if (type === 'signup') {
            // Redirect to dashboard after signup verification
            navigate('/app/projects', { replace: true });
          } else if (type === 'recovery') {
            // Redirect to password reset page
            navigate('/reset-password', { replace: true });
          } else {
            // Default redirect to dashboard
            navigate('/app/projects', { replace: true });
          }
        } else {
          setError('Invalid callback parameters');
        }
      } catch (err) {
        console.error('Callback error:', err);
        setError('An error occurred during authentication');
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <Database className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Authentication Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="text-secondary hover:underline"
          >
            Return to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <Database className="h-12 w-12 text-secondary mx-auto mb-4 animate-pulse" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Verifying...</h1>
        <p className="text-muted-foreground">Please wait while we verify your email.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
