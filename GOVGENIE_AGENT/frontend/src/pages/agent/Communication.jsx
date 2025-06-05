// "use client"
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore.js";
import { io } from "socket.io-client";
// import { toast } from "react-toastify";
import {
  Search,
  MessageSquare,
  Phone,
  Video,
  File,
  Send,
  Clock,
  MoreVertical,
  Image,
  Paperclip,
  Smile,
  ArrowUpRight,
} from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";

const CONVERSATIONS = [

];

const MESSAGES = [

];


function ChatHeader({ conversation, setVideoCallOpen }) {
  const { orderId } = useParams();
  return (
    <div className=" flex items-center justify-between border-b-2  border-r-2 p-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar>
            <AvatarImage
              src={conversation?.customer?.image}
              alt={conversation?.customer?.name}
            />
            <AvatarFallback>
              {conversation?.customer?.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {conversation?.online && (
            <span className="absolute right-0 top-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
          )}
        </div>
        <div>
          <div className="font-medium leading-tight">
            {conversation?.customer?.name}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {conversation?.online ? (
              <span className="text-green-500">Online</span>
            ) : (
              <span>Offline</span>
            )}

            <span>•</span>
            <span>{conversation?.service}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link to={`/communication/room/${orderId}`}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setVideoCallOpen(true)}
          >
            <Video className="h-4 w-4" />
            <span className="sr-only">Video Call</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

function MessageBubble({ message, customer }) {
  const isAgent = message.senderId === "agent";
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Invalid Date:", dateString);
      return "Invalid Date";
    }
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Invalid Date:", dateString);
      return "Invalid Date";
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={`flex ${isAgent ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[80%] flex-col ${
          isAgent ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-lg px-4 py-2 ${
            isAgent ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          <div className="whitespace-pre-wrap text-sm">{message.text}</div>
        </div>

        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <span>{formatTime(message.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

function ChatMessages({ messages, customer }) {
  console.log("chat data", messages);
  return (
    <ScrollArea className="h-[calc(100vh-18rem)] border-r-2 p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message} message={message} customer={customer} />
        ))}
      </div>
    </ScrollArea>
  );
}

function ChatInput() {
  const [message, setMessage] = useState("");

  return (
    <div className="border-t-2 border-b-2 border-r-2 p-2">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="shrink-0">
          <Paperclip className="h-4 w-4" />
          <span className="sr-only">Attach file</span>
        </Button>
        <Textarea
          placeholder="Type your message..."
          className="min-h-10 resize-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button size="icon" className="shrink-0" disabled={!message.trim()}>
          <Send className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Press Enter to send, Shift + Enter for new line
        </div>
      </div>
    </div>
  );
}

function NoConversationSelected() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-4">
      <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
      <h3 className="mb-2 text-xl font-medium">Your Conversations</h3>
      <p className="text-center text-muted-foreground">
        Select a conversation from the list to start chatting.
      </p>
    </div>
  );
}

function VideoCallDialog({ open, onOpenChange, conversation }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start Video Call</DialogTitle>
          <DialogDescription>
            Start a video call with {conversation?.customer?.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={conversation?.customer?.image}
                alt={conversation?.customer?.name}
              />
              <AvatarFallback>
                {conversation?.customer?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{conversation?.customer?.name}</div>
              <div className="text-sm text-muted-foreground">
                {conversation?.orderId} • {conversation?.service}
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-muted p-4 text-center">
            <Video className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="mb-1 font-medium">Ready to start video call?</p>
            <p className="text-sm text-muted-foreground">
              Connect face-to-face to discuss service details and requirements.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button>
            <Video className="mr-2 h-4 w-4" />
            <span>Start Call</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
function Communication() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("messages");
  const [videoCallOpen, setVideoCallOpen] = useState(false);
  const { orderId } = useParams();
  const [agentId, setAgentId] = useState(null);
  const [order, setOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const { user } = useAuthStore();
  const socketRef = useRef(null);
  const [customer, setCustomer] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

       
        const resAgent = await axios.get(
          `http://localhost:5001/api/user/orderdata/${orderId}`
        );

        const fetch = resAgent.data.orders.agentId;
        const customer = resAgent.data.orders.customer;
        setCustomer(customer);
        setOrder(resAgent.data.orders);
        setAgentId(fetch);

    
        if (!socketRef.current) {
          const newSocket = io("http://localhost:7000");
          socketRef.current = newSocket;

      
          if (user && fetch) {
            newSocket.emit("join", { userId: customer, agentId: fetch });
          }

       
          newSocket.on("chatHistory", (messages) => {
            setChatHistory(messages.map((msg) => ({ ...msg, text: msg.text })));
          });

        
          newSocket.on("receiveMessage", (message) => {
            setChatHistory((prev) => [...prev, message]);
          });

       
          newSocket.on("userTyping", () => setIsTyping(true));
          newSocket.on("userStoppedTyping", () => setIsTyping(false));
        }
      } catch (error) {
        console.error("Error fetching chat data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

  
    return () => {
      if (socketRef.current) {
        socketRef.current.off("chatHistory");
        socketRef.current.off("receiveMessage");
        socketRef.current.off("userTyping");
        socketRef.current.off("userStoppedTyping");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []); 
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  const sendMessage = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    const messageData = {
      senderId: agentId,
      receiverId: customer,
      text: message,
      createdAt: new Date().toISOString(),
    };

    if (socketRef.current) {
      socketRef.current.emit("sendMessage", messageData);
    } else {
      console.error("Socket connection is not established.");
    }

    setMessage("");
  };


  const formatTime = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Invalid Date:", dateString);
      return "Invalid Date";
    }
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col border-l-2">
      <div className="grid flex-1 grid-cols-1">
        <div className="flex h-full flex-col">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="border-t-2 border-r-2 border-b-2 px-2">
              <TabsList className="w-full justify-start rounded-none border-b-0 bg-transparent p-0">
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Messages</span>
              </TabsList>
            </div>

            <TabsContent value="messages" className="flex h-full flex-col">
              {order ? (
                <>
                  <div className="flex items-center justify-between border-b-2 border-r-2 p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage
                            src={order?.customer?.image}
                            alt={order?.customer?.name}
                          />
                          <AvatarFallback>
                            {order?.customer?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {order?.online && (
                          <span className="absolute right-0 top-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium leading-tight">
                          {order?.customer?.name}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                     
                          <span>{order?.service}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/communication/room/${orderId}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setVideoCallOpen(true)}
                        >
                          <Video className="h-4 w-4" />
                          <span className="sr-only">Video Call</span>
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <ScrollArea className="h-[calc(100vh-18rem)] border-r-2 p-4">
                    <div className="space-y-4">
                      {chatHistory.map((message, index) => {
                        const isAgent = message.senderId === agentId;
                        return (
                          <div
                            key={
                              message._id || message.id || `message-${index}`
                            } // Ensure a unique key
                            className={`flex ${
                              isAgent ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`flex max-w-[80%] flex-col ${
                                isAgent ? "items-end" : "items-start"
                              }`}
                            >
                              <div
                                className={`rounded-lg px-4 py-2 ${
                                  isAgent
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                <div className="whitespace-pre-wrap text-sm">
                                  {message.text}
                                </div>
                              </div>
                              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                <span>{formatTime(message.createdAt)}</span>
                              </div>
                            </div>
                            {isTyping && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                The agent is typing...
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  <div className="border-t-2 border-b-2 border-r-2 p-2 flex gap-4">
                    <Button variant="outline" size="icon" className="shrink-0">
                      <a
                        href="https://fileqrkaro.onrender.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Paperclip className="h-4 w-4" />
                        <span className="sr-only">Attach file</span>
                      </a>
                    </Button>
                    <form
                      onSubmit={sendMessage}
                      className="flex items-center gap-2 w-full"
                    >
                      <Textarea
                        type="text"
                        placeholder="Type your message..."
                        className="min-h-10 resize-none"
                        value={message}
                        // onKeyDown={handleTyping}
                        // onKeyUp={handleStopTyping}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                      <Button size="icon" className="shrink-0" type="submit">
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send message</span>
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-4">
                  <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-xl font-medium">
                    Your Conversations
                  </h3>
                  <p className="text-center text-muted-foreground">
                    Select a conversation from the list to start chatting.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <VideoCallDialog
        open={videoCallOpen}
        onOpenChange={setVideoCallOpen}
        conversation={order}
      />
    </div>
  );
}

export default Communication;
