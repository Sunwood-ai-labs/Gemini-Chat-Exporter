import { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { type ChatMessage, MessageSender } from '../types';

const API_KEY = process.env.API_KEY;

export const useChat = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_KEY) {
      setError("APIキーが設定されていません。");
      return;
    }

    const initializeChat = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const chatSession = ai.chats.create({
          model: 'gemini-2.5-flash',
        });
        setChat(chatSession);
        
        setMessages([
          {
            id: `gemini-initial-${Date.now()}`,
            sender: MessageSender.MODEL,
            text: 'ようこそ！Geminiです。どのようなご用件でしょうか？',
          },
        ]);
      } catch (e) {
        console.error(e);
        setError("チャットセッションの初期化に失敗しました。");
      }
    };

    initializeChat();
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!chat || isLoading) return;

    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: MessageSender.USER,
      text: message,
    };
    
    // Add user message and a placeholder for the model's response
    setMessages((prevMessages) => [
      ...prevMessages,
      userMessage,
      { id: `model-placeholder-${Date.now()}`, sender: MessageSender.MODEL, text: '' },
    ]);

    try {
      const stream = await chat.sendMessageStream({ message });
      let fullResponse = '';

      for await (const chunk of stream) {
        fullResponse += chunk.text;
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.sender === MessageSender.MODEL) {
            lastMessage.text = fullResponse;
          }
          return newMessages;
        });
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : '不明なエラーが発生しました。';
      setError(`メッセージの送信に失敗しました: ${errorMessage}`);
      setMessages(prev => prev.slice(0, -1)); // Remove placeholder
    } finally {
      setIsLoading(false);
    }
  }, [chat, isLoading]);

  return { messages, isLoading, error, sendMessage };
};