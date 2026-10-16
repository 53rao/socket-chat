import { randomUUID } from "node:crypto";
import WebSocket, { WebSocketServer } from "ws";

const wss=new WebSocketServer({port:3001})

type ChatMessage = {
  id: string;
  username: string;
  text: string;
  timestamp: string;
};

function broadcast(data:unknown){
    const message=JSON.stringify(data)
    wss.clients.forEach((w)=>{
        if(w.readyState===WebSocket.OPEN){
            w.send(message)
        }
    })
}

const history : ChatMessage[]=[]
wss.on('connection',(socket)=>{
    socket.send(
        JSON.stringify({
            type:"history",
            messages:history.slice(-50)
        })
    )
    socket.on("message",(raw)=>{
        try{
            const data=JSON.parse(raw.toString())
            if (data.type !== "message" ||typeof data.username !== "string" ||typeof data.text !== "string")
                return;

            const username=data.username.trim().slice(0,20)
            const text=data.text.trim().slice(0,2000)
            if(!username||!text)
                return 
            const message:ChatMessage={
                id:randomUUID(),
                username,
                text,
                timestamp:new Date().toISOString()
            }
            history.push(message)

            if (history.length > 100) 
                history.shift();
            broadcast({
                type:"message",
                message
            })

        }
        catch{
            socket.send(
                JSON.stringify({
                    type: "error",
                    message: "Invalid message format",
                })
            )
        }

    })
})
wss.on("listening", () => {
  console.log("WebSocket server running at ws://localhost:3001");
});
