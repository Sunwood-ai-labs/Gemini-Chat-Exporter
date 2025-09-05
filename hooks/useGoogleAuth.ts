import { useState, useEffect, useCallback, useRef } from 'react';
import { type GoogleUserProfile } from '../types';

declare global {
  interface Window {
    google: any;
  }
}

export const useGoogleAuth = (clientId: string) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<GoogleUserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const scriptId = 'google-gsi-script';
    if (document.getElementById(scriptId)) {
        if(window.google) setIsInitialized(true);
        return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setIsInitialized(true);
    script.onerror = () => {
      setError('Failed to load Google Sign-In script.');
    };
    document.body.appendChild(script);

    return () => {
      const scriptElement = document.getElementById(scriptId);
      if (scriptElement) {
        document.body.removeChild(scriptElement);
      }
    };
  }, []);

  useEffect(() => {
    // This effect hook is responsible for initializing the Google token client.
    // It depends on the GSI script being loaded (`isInitialized`) and a valid `clientId`.

    if (!isInitialized) {
      // If the Google script isn't loaded yet, do nothing.
      return;
    }

    if (!clientId) {
      // If the clientId is cleared or not yet loaded, ensure we don't have a stale client.
      setTokenClient(null);
      return;
    }

    try {
      // With a script and a client ID, we can initialize.
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/spreadsheets',
        callback: (tokenResponse: any) => {
          // This callback handles the response from the Google auth popup.
          if (tokenResponse.error) {
            setError(tokenResponse.error_description || 'An unknown error occurred during authentication.');
            return;
          }
          
          const token = tokenResponse.access_token;
          
          // We have a token, now fetch user info.
          fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(response => {
            if (!response.ok) {
              return response.json().then(err => { throw new Error(err.error_description || 'Failed to fetch user info') });
            }
            return response.json();
          })
          .then(userInfo => {
            // Success! Update the application state.
            setAccessToken(token);
            setIsSignedIn(true);
            setUser({
              email: userInfo.email,
              name: userInfo.name,
              picture: userInfo.picture,
            });
            setError(null);
          })
          .catch((fetchError: Error) => {
            // If fetching user info fails, we should treat it as a failed sign-in.
            console.error('Failed to fetch user info:', fetchError);
            setError(`Authentication succeeded, but failed to fetch user data: ${fetchError.message}`);
            
            // Revoke the token and reset the state to ensure a clean slate.
            window.google?.accounts.oauth2.revoke(token, () => {});
            setIsSignedIn(false);
            setUser(null);
            setAccessToken(null);
          });
        },
      });

      setTokenClient(() => client);
    } catch (e: any) {
      console.error("Error initializing Google Auth:", e);
      setError(`Failed to initialize Google Sign-In. Please check if your Client ID is correct and the origin is authorized in your Google Cloud project. Error: ${e.message}`);
      setTokenClient(null);
    }

    // This hook should only re-run when the GSI script is loaded or the Client ID changes.
  }, [isInitialized, clientId]);


  const handleSignIn = () => {
    setError(null);
    if (tokenClient) {
      tokenClient.requestAccessToken();
    } else {
      setError('Google Sign-In is not ready. Please ensure a valid Client ID is saved.');
    }
  };

  const handleSignOut = useCallback(() => {
    if (accessToken) {
      window.google?.accounts.oauth2.revoke(accessToken, () => {});
    }
    setIsSignedIn(false);
    setUser(null);
    setAccessToken(null);
    setError(null);
  }, [accessToken]);

  return { isInitialized, isSignedIn, user, error, accessToken, handleSignIn, handleSignOut };
};