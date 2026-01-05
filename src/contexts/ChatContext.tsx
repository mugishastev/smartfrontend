import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  ChatConversation,
  ChatMessage,
} from "@/lib/types";
import {
  getChatConversations,
  getChatMessages,
  sendChatMessage,
} from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

type ChatContextValue = {
  conversations: ChatConversation[];
  selectedConversation: ChatConversation | null;
  messages: ChatMessage[];
  loading: boolean;
  refreshConversations: () => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  sendMessage: (params: {
    conversationId: string;
    receiverId: string;
    content: string;
    attachments?: string[];
  }) => Promise<void>;
};

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, ChatMessage[]>>({});
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket>();
  const { toast } = useToast();

  const socketUrl = useMemo(() => {
    const raw = import.meta.env.VITE_API_URL || "";
    const normalized = raw.replace(/\/+$/, "");
    if (normalized) {
      return normalized.replace(/\/api$/i, "");
    }
    const fallback = import.meta.env.PROD ? "https://smartcoophub.andasy.dev" : "http://localhost:5001";
    return fallback;
  }, []);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId]
  );

  const messages = useMemo(
    () => (selectedConversationId ? messagesByConversation[selectedConversationId] ?? [] : []),
    [messagesByConversation, selectedConversationId]
  );

  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await getChatConversations();
      setConversations(response.data ?? []);
    } catch (error: any) {
      console.error("Error loading conversations", error);
      toast({
        variant: "destructive",
        title: "Chat Error",
        description: error?.message || "Unable to load conversations",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await getChatMessages(conversationId);
      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]: response.data ?? [],
      }));
    } catch (error: any) {
      console.error("Unable to load chat messages", error);
      toast({
        variant: "destructive",
        title: "Chat Error",
        description: error?.message || "Failed to load messages",
      });
    }
  };

  const selectConversation = async (conversationId: string) => {
    setSelectedConversationId(conversationId);
    if (!messagesByConversation[conversationId]) {
      await fetchMessages(conversationId);
    }
    if (socketRef.current) {
      socketRef.current.emit("joinConversation", conversationId);
    }
  };

  const sendMessage = async (payload: {
    conversationId: string;
    receiverId: string;
    content: string;
    attachments?: string[];
  }) => {
    try {
      const response = await sendChatMessage(payload.conversationId, payload);
      setMessagesByConversation((prev) => ({
        ...prev,
        [payload.conversationId]: [...(prev[payload.conversationId] ?? []), response.data].filter(Boolean),
      }));
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === payload.conversationId
            ? { ...conv, lastMessageAt: new Date().toISOString() }
            : conv
        )
      );
    } catch (error: any) {
      console.error("Failed to send chat message", error);
      toast({
        variant: "destructive",
        title: "Chat Error",
        description: error?.message || "Unable to send message",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket"],
    });
    socketRef.current = socket;
    socket.on("connect", () => {
      console.log("Chat socket connected", socket.id);
    });
    socket.on("chat:message", ({ conversationId, message }: { conversationId: string; message: ChatMessage }) => {
      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] ?? []), message],
      }));
      setConversations((prev) =>
        prev.map((conv) => (conv.id === conversationId ? { ...conv, lastMessageAt: new Date().toISOString() } : conv))
      );
    });
    socket.on("disconnect", () => {
      console.log("Chat socket disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, [socketUrl]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        selectedConversation,
        messages,
        loading,
        refreshConversations: loadConversations,
        selectConversation,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextValue => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
};

