import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { backend } from 'declarations/backend';
import '/index.css';

const App = () => {
  const [chat, setChat] = useState([
    {
      role: { system: null },
      content: "I'm a sovereign AI agent living on the Internet Computer. Ask me anything.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [messageFeedback, setMessageFeedback] = useState({});
  const fileInputRef = useRef(null);
  const chatBoxRef = useRef(null);

  const formatDate = (date) => {
    const h = '0' + date.getHours();
    const m = '0' + date.getMinutes();
    return `${h.slice(-2)}:${m.slice(-2)}`;
  };

  const askAgent = async (messages) => {
    try {
      const response = await backend.chat(messages);
      setChat((prevChat) => {
        const newChat = [...prevChat];
        newChat.pop();
        newChat.push({ 
          role: { system: null }, 
          content: response,
          timestamp: new Date()
        });
        return newChat;
      });
    } catch (e) {
      console.log(e);
      const eStr = String(e);
      const match = eStr.match(/(SysTransient|CanisterReject), \\+"([^\\"]+)/);
      if (match) {
        alert(match[2]);
      }
      setChat((prevChat) => {
        const newChat = [...prevChat];
        newChat.pop();
        return newChat;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      role: { user: null },
      content: inputValue,
      file: selectedFile ? URL.createObjectURL(selectedFile) : null,
      timestamp: new Date()
    };
    const thinkingMessage = {
      role: { system: null },
      content: 'Thinking ...',
      timestamp: new Date()
    };
    setChat((prevChat) => [...prevChat, userMessage, thinkingMessage]);
    setInputValue('');
    setSelectedFile(null);
    setIsLoading(true);
    const messagesToSend = chat.slice(1).concat(userMessage);
    askAgent(messagesToSend);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleFeedback = (index, isLike) => {
    setMessageFeedback(prev => ({
      ...prev,
      [index]: isLike ? 'liked' : 'disliked'
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a temporary notification here
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      {/* Header with dark mode toggle */}
      <header className={`p-4 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">AI Legal Assistant</h1>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <div className="flex max-w-6xl mx-auto">
        {/* Chat History Sidebar */}
        <div className={`${showHistory ? 'w-64' : 'w-0'} transition-all duration-300 ${darkMode ? 'bg-gray-800 border-r border-gray-700' : 'bg-white border-r'} overflow-hidden`}>
          <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Chat History</h2>
              <button 
                onClick={() => setShowHistory(false)}
                className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chat.filter(m => 'user' in m.role).map((message, index) => (
                <div 
                  key={index} 
                  className={`p-3 mb-2 rounded-lg cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  onClick={() => {
                    // Scroll to this message in main chat
                    const element = document.getElementById(`message-${index}`);
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <div className="text-sm truncate">{message.content}</div>
                  <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatDate(message.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-[calc(100vh-72px)]">
          {!showHistory && (
            <button 
              onClick={() => setShowHistory(true)}
              className={`absolute left-4 top-20 p-2 rounded-full shadow-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          )}

          <div className="flex-1 overflow-hidden flex flex-col p-4">
            <div 
              ref={chatBoxRef}
              className={`flex-1 overflow-y-auto rounded-lg p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
            >
              {chat.map((message, index) => {
                const isUser = 'user' in message.role;
                const text = message.content;
                const fileUrl = message.file;
                const feedback = messageFeedback[index];

                return (
                  <div 
                    id={`message-${index}`}
                    key={index} 
                    className={`mb-4 flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[70%] p-4 rounded-lg relative group ${isUser 
                        ? darkMode 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-500 text-white'
                        : darkMode 
                          ? 'bg-gray-700' 
                          : 'bg-white shadow'}`}
                    >
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium">{isUser ? 'You' : 'Bot'}</span>
                        <span className={`opacity-70 ${isUser ? 'text-blue-100' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                      <div className="mb-2">{text}</div>
                      
                      {fileUrl && (
                        <div className="mt-2">
                          {fileUrl.match(/\.(jpeg|jpg|gif|png)$/) ? (
                            <img src={fileUrl} alt="Attachment" className="max-h-40 rounded" />
                          ) : (
                            <a 
                              href={fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                            >
                              View Attachment
                            </a>
                          )}
                        </div>
                      )}
                      
                      {/* Message actions */}
                      {!isUser && (
                        <div className={`absolute -right-10 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <button 
                            onClick={() => copyToClipboard(text)}
                            className="p-1 hover:text-blue-500"
                            title="Copy"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => toggleFeedback(index, true)}
                            className={`p-1 ${feedback === 'liked' ? 'text-green-500' : 'hover:text-green-500'}`}
                            title="Like"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => toggleFeedback(index, false)}
                            className={`p-1 ${feedback === 'disliked' ? 'text-red-500' : 'hover:text-red-500'}`}
                            title="Dislike"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m0 0v9m0-9h2.765a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 14H17m0 0v7m-7-7h2m-2 0H7" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <form className="mt-4" onSubmit={handleSubmit}>
              {selectedFile && (
                <div className={`flex items-center justify-between mb-2 p-2 rounded ${darkMode ? 'bg-blue-900' : 'bg-blue-50'}`}>
                  <span className="truncate text-sm">{selectedFile.name}</span>
                  <button 
                    type="button" 
                    onClick={removeFile}
                    className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
              <div className="flex">
                <input
                  type="text"
                  className={`flex-1 rounded-l-lg border p-3 focus:outline-none focus:ring-2 ${darkMode 
                    ? 'bg-gray-700 border-gray-600 focus:ring-blue-500' 
                    : 'bg-white border-gray-300 focus:ring-blue-500'}`}
                  placeholder="Ask anything ..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading}
                />
                <div className="flex">
                  <label className={`cursor-pointer p-3 border-t border-b ${darkMode 
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                    : 'bg-white border-gray-300 hover:bg-gray-100'}`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </label>
                  <button
                    type="submit"
                    className={`rounded-r-lg p-3 text-white ${darkMode 
                      ? isLoading ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-500' 
                      : isLoading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'}`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);