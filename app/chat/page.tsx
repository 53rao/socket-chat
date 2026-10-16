"use client"
import { SubmitEvent } from "react";
import { useEffect, useRef, useState } from "react";
type ChatMessage = {
  id: string;
  username: string;
  text: string;
  timestamp: string;
};



type ServerEvent ={ type: "history"; messages: ChatMessage[] } | { type: "message"; message: ChatMessage } | { type: "error"; message: string };

export default function ChatPage(){
    const [username, setUsername] = useState("");
    const [joined, setJoined] = useState(false);
    const socketRef=useRef<WebSocket|null>(null)
    const [connected,setConnected]=useState(false)
    const [messages,setMessages]=useState<ChatMessage[]>([]);
    const [error,setError]=useState("")
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const [text, setText] = useState("");

    useEffect(()=>{
        if(!joined)
            return
        const socket=new WebSocket("ws://localhost:3001");
        socketRef.current = socket;
        socket.onopen=()=>{setConnected(true)}
        socket.onmessage=(event)=>{
            const data:ServerEvent=JSON.parse(event.data)
            if(data.type==="history"){
                setMessages(data.messages)
            }
            if(data.type==="message"){
                setMessages((prev)=>{
                      if (prev.some((m) => m.id === data.message.id))
                        return prev;
                    return [...prev,data.message].slice(-100)

                })
            }
            if (data.type === "error") {
                setError(data.message);
      }
      socket.onclose = () => setConnected(false);
      socket.onerror = () => setError("Connection error. Check the server.");
    }


    // cleanup function : runs during unmounting
    return () => {
        socket.close();
        socketRef.current = null;
    };
    },[joined])


    useEffect(() => 
        {bottomRef.current?.scrollIntoView({ behavior: "smooth" });},
        [messages]
    );

    function joinChat(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!username.trim()) return;
        setUsername(username.trim().slice(0, 30));
        setJoined(true);
        setError("");
    }
    function sendMessage(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        const socket = socketRef.current;
        const value = text.trim();

        if (!value || !socket || socket.readyState !== WebSocket.OPEN)
            return;
        

        socket.send(JSON.stringify({
                type: "message",
                username,
                text: value,
            })
        );

        setText("");
    }

    if (!joined) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-black text-white">
        <form className="bg-neutral-900 border border-neutral-800 p-10 rounded-2xl w-full max-w-sm text-center shadow-2xl" onSubmit={joinChat}>
          <div className="text-4xl mb-4">💬</div>
          <h1 className="text-xl font-semibold mb-2 text-white">Welcome to Chat</h1>
          <p className="text-neutral-400 text-sm mb-6">Choose a username to start chatting.</p>

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your username"
            maxLength={30}
            required
            autoFocus
            className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-3 rounded-xl text-sm outline-none focus:border-white transition-colors box-border mb-4"
          />


          <button type="submit" className="w-full bg-white text-black font-semibold py-3 rounded-xl text-sm cursor-pointer hover:opacity-90 transition-opacity">
            Join chat
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="h-screen flex items-center justify-center p-4 bg-black text-white box-border">
      <section className="bg-neutral-900 border border-neutral-800 w-full max-w-2xl h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <header className="p-4 px-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div>
            <h1 className="text-base font-semibold mb-1 text-white">Chat Room</h1>
            <p className="text-xs text-neutral-400 m-0">
              Signed in as <strong className="text-white">{username}</strong>
            </p>
          </div>

          <span className={`flex items-center gap-2 text-xs ${connected ? "text-white" : "text-neutral-500"}`}>
            <span className={`w-2 h-2 rounded-full ${connected ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" : "bg-neutral-600"}`} />
            {connected ? "Connected" : "Connecting..."}
          </span>
        </header>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-black">
          {messages.length === 0 && (
            <div className="m-auto text-center text-neutral-500 flex flex-col items-center gap-2">
              <span className="text-3xl">👋</span>
              <p className="text-sm m-0">No messages yet. Start the conversation!</p>
            </div>
          )}

          {messages.map((message) => {
            const mine = message.username === username;

            return (
              <div
                key={message.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[75%] p-3 px-4 rounded-xl border ${mine ? "bg-neutral-800 border-neutral-700 text-white" : "bg-neutral-900 border-neutral-800 text-neutral-200"}`}>
                  <div className="flex justify-between items-center gap-6 mb-1 text-xs text-neutral-400">
                    <strong className="text-white">{message.username}</strong>
                    <time className="text-neutral-500">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                  <p className="m-0 text-sm leading-relaxed break-words text-neutral-200">{message.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {error && <p className="bg-red-950 border border-red-900 text-red-300 p-2 px-4 m-0 text-xs text-center">{error}</p>}

        <form className="p-4 px-6 border-t border-neutral-800 flex gap-3 bg-neutral-950" onSubmit={sendMessage}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message..."
            maxLength={2000}
            disabled={!connected}
            className="flex-1 bg-neutral-900 border border-neutral-800 text-white px-4 py-3 rounded-xl text-sm outline-none focus:border-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button 
            disabled={!connected || !text.trim()}
            className="bg-white text-black font-semibold px-5 py-3 rounded-xl text-sm cursor-pointer hover:opacity-90 transition-opacity disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Send
          </button>
        </form>
      </section>
    </main> 
  );
}