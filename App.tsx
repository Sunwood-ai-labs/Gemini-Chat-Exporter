import React, { useState, useRef, useEffect } from 'react';
import { useChat } from './hooks/useChat';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import { MessageBubble } from './components/MessageBubble';
import { SendIcon, DownloadIcon, SettingsIcon, CloseIcon, CopyIcon, GoogleIcon } from './components/icons';
import { type ChatMessage, MessageSender, type GoogleUserProfile } from './types';

// START: SettingsModal Component
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  onSave: (newClientId: string) => void;
  isAuthInitialized: boolean;
  isSignedIn: boolean;
  user: GoogleUserProfile | null;
  authError: string | null;
  handleSignIn: () => void;
  handleSignOut: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, onClose, clientId, onSave,
    isAuthInitialized, isSignedIn, user, authError,
    handleSignIn, handleSignOut 
}) => {
  const [localClientId, setLocalClientId] = useState(clientId);
  const [origin, setOrigin] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    setLocalClientId(clientId);
  }, [clientId]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const handleSave = () => {
    onSave(localClientId);
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(origin).then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
        setCopySuccess('Failed to copy');
        setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  return (
    <div
      className={`fixed inset-0 bg-black/80 z-50 flex justify-center items-center transition-opacity duration-300 ease-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div
        className={`bg-slate-800 rounded-xl shadow-2xl w-full max-w-md m-4 p-6 relative text-slate-200 transition-transform duration-300 ease-out ${isOpen ? 'scale-100' : 'scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="settings-title" className="text-2xl font-bold text-slate-100">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            aria-label="Close settings"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
            <div>
                <label htmlFor="google-client-id" className="block text-sm font-medium text-slate-300 mb-2">
                    Google Client ID
                </label>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        id="google-client-id"
                        value={localClientId}
                        onChange={(e) => setLocalClientId(e.target.value)}
                        placeholder="Enter your Google Client ID"
                        className="flex-grow bg-slate-700 text-slate-200 border border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    />
                    <button
                        onClick={handleSave}
                        className="px-6 py-3 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                        Save
                    </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                    Used for Google integrations like exporting to Google Sheets.
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Authorized JavaScript Origin
                </label>
                <div className="flex items-center gap-2">
                    <p className="flex-grow bg-slate-900 text-slate-300 rounded-md p-3 text-sm font-mono break-all">
                        {origin}
                    </p>
                    <button 
                        onClick={handleCopy}
                        className="flex-shrink-0 p-2 rounded-md bg-slate-600 hover:bg-slate-500 transition-colors"
                        aria-label="Copy origin URL"
                    >
                        <CopyIcon className="w-5 h-5"/>
                    </button>
                </div>
                 {copySuccess && <p className="text-xs text-green-400 mt-2">{copySuccess}</p>}
                <p className="text-xs text-slate-400 mt-2">
                    Add this URL to your Authorized JavaScript origins in the Google Cloud Console.
                </p>
            </div>
        </div>
        
        <hr className="my-6 border-slate-700" />

        <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Google Account Connection</h3>
            {!clientId ? (
                <p className="text-sm text-slate-400">
                    Please save a Google Client ID above to connect your account.
                </p>
            ) : (
                <>
                    {!isSignedIn ? (
                        <div>
                            <button
                                onClick={handleSignIn}
                                disabled={!isAuthInitialized}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-slate-800 font-semibold rounded-lg hover:bg-slate-200 transition-colors disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-wait"
                            >
                                <GoogleIcon className="w-5 h-5" />
                                {isAuthInitialized ? 'Connect Google Account' : 'Initializing...'}
                            </button>
                            {authError && <p className="text-xs text-red-400 mt-2 text-center">{authError}</p>}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <img src={user?.picture} alt="User profile" className="w-10 h-10 rounded-full" />
                                <div className="truncate">
                                    <p className="font-semibold text-white truncate">{user?.name}</p>
                                    <p className="text-sm text-slate-400 truncate">{user?.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="flex-shrink-0 ml-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-semibold transition-colors"
                            >
                                Disconnect
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>

        <div className="mt-8 flex justify-end">
            <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-white font-semibold transition-colors duration-200"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};
// END: SettingsModal Component


const ChatInput: React.FC<{
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmedInput = input.trim();
    if (trimmedInput) {
      onSendMessage(trimmedInput);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="p-4 bg-slate-800/50 backdrop-blur-sm border-t border-slate-700">
      <div className="relative max-w-4xl mx-auto">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          className="w-full bg-slate-700 text-slate-200 border border-slate-600 rounded-lg py-3 pl-4 pr-16 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow duration-200 max-h-48"
          rows={1}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full text-white bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 disabled:bg-none disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-110"
          aria-label="Send message"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const { messages, isLoading, error, sendMessage } = useChat();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [googleClientId, setGoogleClientId] = useState<string>('');
  
  const { 
    isInitialized: isAuthInitialized, 
    isSignedIn, 
    user, 
    error: authError, 
    handleSignIn, 
    handleSignOut 
  } = useGoogleAuth(googleClientId);

  useEffect(() => {
    const savedClientId = localStorage.getItem('googleClientId');
    if (savedClientId) {
      setGoogleClientId(savedClientId);
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSaveClientId = (newClientId: string) => {
    const trimmedId = newClientId.trim();
    localStorage.setItem('googleClientId', trimmedId);
    setGoogleClientId(trimmedId);
    if(googleClientId !== trimmedId && isSignedIn){
        handleSignOut();
    }
  };
  
  const exportToCsv = () => {
    if (messages.length <= 1) { // Also check for only the initial message
      alert("No conversation to export.");
      return;
    }
    
    const escapeCsvField = (field: string): string => {
      if (/[",\n]/.test(field)) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    };

    const headers = ["Sender", "Message"];
    // Filter out the initial placeholder message if it's the only one from the model
    const rows = messages.filter(msg => msg.id !== `gemini-initial-${Date.now()}`).map(msg => [
      msg.sender === MessageSender.USER ? 'User' : 'Gemini',
      escapeCsvField(msg.text)
    ]);
    
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // UTF-8 BOM
    let csvContent = headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.setAttribute("download", `gemini-chat-history-${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-200 font-sans">
      <header className="flex items-center justify-between p-4 bg-slate-800/70 backdrop-blur-sm border-b border-slate-700 shadow-md z-10">
        <h1 className="text-xl font-bold text-slate-100">Gemini Chat Exporter</h1>
        <div className="flex items-center gap-4">
            <button 
                onClick={exportToCsv}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-semibold transition-colors duration-200 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                disabled={messages.length <= 1}
            >
                <DownloadIcon className="w-5 h-5" />
                Export to CSV
            </button>
            <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-full text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                aria-label="Open settings"
            >
                <SettingsIcon className="w-6 h-6" />
            </button>
        </div>
      </header>
      
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg, index) => (
            <MessageBubble key={msg.id} message={msg} isTyping={isLoading && index === messages.length -1} />
          ))}
        </div>
      </main>

      {error && (
        <div className="p-4 bg-red-900/50 text-red-300 border-t border-red-800">
          <p className="max-w-4xl mx-auto text-center">{error}</p>
        </div>
      )}

      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        clientId={googleClientId}
        onSave={handleSaveClientId}
        isAuthInitialized={isAuthInitialized}
        isSignedIn={isSignedIn}
        user={user}
        authError={authError}
        handleSignIn={handleSignIn}
        handleSignOut={handleSignOut}
      />
    </div>
  );
};

export default App;