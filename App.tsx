import React, { useState, useRef, useEffect } from 'react';
import { useChat } from './hooks/useChat';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import { MessageBubble } from './components/MessageBubble';
import { SendIcon, DownloadIcon, SettingsIcon, CloseIcon, CopyIcon, GoogleIcon } from './components/icons';
import { type ChatMessage, MessageSender, type GoogleUserProfile } from './types';

// Prefer Client ID from Vite env (exposed via vite.config.ts)
const ENV_GOOGLE_CLIENT_ID: string = (process.env.GOOGLE_CLIENT_ID as unknown as string) || '';

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
  isEnvConfigured: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, onClose, clientId, onSave,
    isAuthInitialized, isSignedIn, user, authError,
    handleSignIn, handleSignOut,
    isEnvConfigured
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
        className={`bg-[#595959] rounded-2xl shadow-3xl w-full max-w-md m-4 p-6 relative text-[#F2F2F2] transition-transform duration-300 ease-out ${isOpen ? 'scale-100' : 'scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="settings-title" className="text-2xl font-bold text-[#F2E205]">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#A6A6A6] hover:bg-[#595959] hover:text-[#F2F2F2] transition-colors"
            aria-label="Close settings"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
            <div>
                <label htmlFor="google-client-id" className="block text-sm font-medium text-[#A6A6A6] mb-2">
                    Google Client ID
                </label>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        id="google-client-id"
                        value={localClientId}
                        onChange={(e) => setLocalClientId(e.target.value)}
                        placeholder="Enter your Google Client ID"
                        className="flex-grow bg-[#595959] text-[#F2F2F2] border border-[#A6A6A6]/60 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#F2E205] transition-shadow disabled:opacity-70"
                        disabled={isEnvConfigured}
                        readOnly={isEnvConfigured}
                    />
                    <button
                        onClick={handleSave}
                        className="px-6 py-3 bg-[#F2E205] hover:bg-[#F2E205]/90 rounded-lg text-[#0D0D0D] font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={isEnvConfigured}
                    >
                        Save
                    </button>
                </div>
                <p className="text-xs text-[#A6A6A6] mt-2">
                    {isEnvConfigured
                      ? 'Client ID is configured via environment variables and cannot be edited here.'
                      : 'Used for Google integrations like exporting to Google Sheets.'}
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-[#A6A6A6] mb-2">
                    Authorized JavaScript Origin
                </label>
                <div className="flex items-center gap-2">
                    <p className="flex-grow bg-[#0D0D0D] text-[#F2F2F2]/80 rounded-md p-3 text-sm font-mono break-all">
                        {origin}
                    </p>
                    <button
                        onClick={handleCopy}
                        className="flex-shrink-0 p-2 rounded-md bg-[#A6A6A6] hover:bg-[#595959] transition-colors"
                        aria-label="Copy origin URL"
                    >
                        <CopyIcon className="w-5 h-5"/>
                    </button>
                </div>
                 {copySuccess && <p className="text-xs text-[#F2E205] mt-2">{copySuccess}</p>}
                <p className="text-xs text-[#A6A6A6] mt-2">
                    Add this URL to your Authorized JavaScript origins in the Google Cloud Console.
                </p>
            </div>
        </div>
        
        <hr className="my-6 border-[#A6A6A6]/60" />

        <div>
            <h3 className="text-lg font-semibold text-[#F2F2F2] mb-4">Google Account Connection</h3>
            {!clientId ? (
                <p className="text-sm text-[#A6A6A6]">
                    Please save a Google Client ID above to connect your account.
                </p>
            ) : (
                <>
                    {!isSignedIn ? (
                        <div>
                            <button
                                onClick={handleSignIn}
                                disabled={!isAuthInitialized}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#F2E205] text-[#0D0D0D] font-semibold rounded-lg hover:bg-[#F2E205]/90 transition-colors disabled:bg-[#A6A6A6] disabled:text-[#0D0D0D]/70 disabled:cursor-wait"
                            >
                                <GoogleIcon className="w-5 h-5" />
                                {isAuthInitialized ? 'Connect Google Account' : 'Initializing...'}
                            </button>
                            {authError && <p className="text-xs text-[#F2E205] mt-2 text-center">{authError}</p>}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between bg-[#0D0D0D]/80 rounded-lg p-3">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <img src={user?.picture} alt="User profile" className="w-10 h-10 rounded-full" />
                                <div className="truncate">
                                    <p className="font-semibold text-[#F2F2F2] truncate">{user?.name}</p>
                                    <p className="text-sm text-[#A6A6A6] truncate">{user?.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="flex-shrink-0 ml-2 px-4 py-2 bg-[#F2E205] hover:bg-[#F2E205]/90 rounded-lg text-[#0D0D0D] text-sm font-semibold transition-colors"
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
                className="px-6 py-2 bg-[#A6A6A6] hover:bg-[#595959] rounded-lg text-[#F2F2F2] font-semibold transition-colors duration-200"
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
    <div className="p-4 bg-[#595959]/60 backdrop-blur-sm border-t border-[#A6A6A6]/50">
      <div className="relative max-w-4xl mx-auto">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          className="w-full bg-[#595959] text-[#F2F2F2] border border-[#A6A6A6]/60 rounded-lg py-3 pl-4 pr-16 resize-none focus:outline-none focus:ring-2 focus:ring-[#F2E205] transition-shadow duration-200 max-h-48"
          rows={1}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full text-[#0D0D0D] bg-[#F2E205] hover:bg-[#F2E205]/90 disabled:bg-[#A6A6A6] disabled:bg-none disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-110 shadow-lg"
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
  const [googleClientId, setGoogleClientId] = useState<string>(ENV_GOOGLE_CLIENT_ID || '');
  const [isExportingSheets, setIsExportingSheets] = useState(false);
  const [sheetsStatus, setSheetsStatus] = useState<string | null>(null);
  
  const { 
    isInitialized: isAuthInitialized, 
    isSignedIn, 
    user, 
    error: authError, 
    accessToken,
    handleSignIn, 
    handleSignOut 
  } = useGoogleAuth(googleClientId);

  useEffect(() => {
    // Prefer env-provided Client ID; fallback to saved one only if env is not set
    if (!ENV_GOOGLE_CLIENT_ID) {
      const savedClientId = localStorage.getItem('googleClientId');
      if (savedClientId) {
        setGoogleClientId(savedClientId);
      }
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
    // Filter out the initial placeholder message
    const rows = messages.filter(msg => !(msg.sender === MessageSender.MODEL && msg.id.startsWith('gemini-initial-'))).map(msg => [
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

  const exportToGoogleSheets = async () => {
    try {
      setSheetsStatus(null);
      if (messages.length <= 1) {
        setSheetsStatus('エクスポートする会話がありません。');
        return;
      }
      if (!isSignedIn || !accessToken) {
        setSheetsStatus('Googleアカウントに接続してください。設定から接続可能です。');
        setIsSettingsOpen(true);
        return;
      }

      setIsExportingSheets(true);

      const filtered = messages.filter(m => !(m.sender === MessageSender.MODEL && m.id.startsWith('gemini-initial-')));
      if (filtered.length === 0) {
        setSheetsStatus('エクスポートする会話がありません。');
        setIsExportingSheets(false);
        return;
      }

      const timestamp = new Date().toLocaleString();
      const values = filtered.map(m => [timestamp, m.sender === MessageSender.USER ? 'User' : 'Gemini', m.text]);

      const lsKey = `sheets.spreadsheetId.${user?.email ?? 'default'}`;
      let spreadsheetId = localStorage.getItem(lsKey);

      const authHeaders = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      } as const;

      if (!spreadsheetId) {
        // Create spreadsheet with a default sheet named "Conversations"
        const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            properties: { title: 'Gemini Sheets Exporter' },
            sheets: [{ properties: { title: 'Conversations' } }],
          }),
        });
        if (createRes.status === 401) {
          setSheetsStatus('認証が無効です。再接続してください。');
          setIsExportingSheets(false);
          return;
        }
        if (!createRes.ok) {
          const errText = await createRes.text().catch(() => '');
          throw new Error(`スプレッドシートの作成に失敗しました: ${errText || createRes.statusText}`);
        }
        const created = await createRes.json();
        spreadsheetId = created.spreadsheetId as string;
        localStorage.setItem(lsKey, spreadsheetId);

        // Write header row
        const headerRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent('Conversations!A1:C1')}?valueInputOption=RAW`,
          {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify({ values: [[ 'Timestamp', 'Sender', 'Message' ]] }),
          }
        );
        if (!headerRes.ok) {
          // Non-fatal; continue but inform user
          console.warn('Failed to write header row');
        }
      }

      // Append rows
      const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent('Conversations!A:C')}:append?valueInputOption=USER_ENTERED`;
      const appendRes = await fetch(appendUrl, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ values }),
      });
      if (appendRes.status === 401) {
        setSheetsStatus('認証が無効です。再接続してください。');
        setIsExportingSheets(false);
        return;
      }
      if (!appendRes.ok) {
        const errText = await appendRes.text().catch(() => '');
        throw new Error(`エクスポートに失敗しました: ${errText || appendRes.statusText}`);
      }

      const openUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
      setSheetsStatus('エクスポートが完了しました。スプレッドシートを開きます。');
      window.open(openUrl, '_blank', 'noopener');
    } catch (e: any) {
      console.error(e);
      setSheetsStatus(e?.message || 'エクスポート中にエラーが発生しました。');
    } finally {
      setIsExportingSheets(false);
      // Auto-clear status after a short delay
      setTimeout(() => setSheetsStatus(null), 4000);
    }
  };


  return (
    <div className="flex flex-col h-screen bg-[#0D0D0D] text-[#F2F2F2] font-sans">
      <header className="flex items-center justify-between p-4 bg-[#595959]/80 backdrop-blur-xl border-b border-[#A6A6A6]/50 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)] z-10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-[#F2E205] shadow-2xl" />
          <h1 className="text-lg sm:text-xl font-bold text-[#F2E205] tracking-tight">Gemini Sheets Exporter</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={exportToCsv}
            className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[#595959] hover:bg-[#A6A6A6] rounded-lg text-[#F2F2F2] text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:bg-[#A6A6A6] disabled:text-[#F2F2F2]/50 disabled:cursor-not-allowed"
            disabled={messages.length <= 1}
          >
            <DownloadIcon className="w-4 h-4" />
            CSVエクスポート
          </button>
          <button
            onClick={exportToGoogleSheets}
            className="flex items-center gap-2 px-3 py-2 bg-[#F2E205] text-[#0D0D0D] hover:bg-[#F2E205]/90 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:bg-[#A6A6A6] disabled:text-[#0D0D0D]/50 disabled:cursor-not-allowed"
            disabled={messages.length <= 1 || isExportingSheets}
            aria-label="Export to Google Sheets"
            title={isSignedIn ? 'スプレッドシートに保存' : '設定からGoogleアカウントに接続してください'}
          >
            <GoogleIcon className="w-4 h-4" />
            {isExportingSheets ? '保存中…' : 'スプレッドシートに保存'}
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-full text-[#A6A6A6] hover:bg-[#595959] hover:text-[#F2F2F2] transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
            aria-label="Open settings"
            title="設定"
          >
            <SettingsIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      {sheetsStatus && (
        <div className="px-4 pt-3">
          <div className="max-w-4xl mx-auto text-sm text-[#F2F2F2] bg-[#595959]/80 border border-[#A6A6A6]/60 rounded-xl px-4 py-2 shadow-lg backdrop-blur-sm">
            {sheetsStatus}
          </div>
        </div>
      )}

      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto bg-[#595959]/40 border border-[#A6A6A6]/40 rounded-3xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.8)] p-3 sm:p-4 md:p-6 backdrop-blur-xl">
          {messages.map((msg, index) => (
            <MessageBubble key={msg.id} message={msg} isTyping={isLoading && index === messages.length -1} />
          ))}
        </div>
      </main>

      {error && (
        <div className="p-4 bg-[#F2E205]/20 text-[#F2E205] border-t border-[#F2E205]/40">
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
        isEnvConfigured={Boolean(ENV_GOOGLE_CLIENT_ID)}
      />
    </div>
  );
};

export default App;
