import React from 'react';
import { type ChatMessage, MessageSender } from '../types';
import { UserIcon, BotIcon } from './icons';

interface MessageBubbleProps {
  message: ChatMessage;
  isTyping?: boolean;
}

const LoadingIndicator: React.FC = () => (
    <div className="flex items-center justify-center space-x-1.5">
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
    </div>
);


export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isTyping = false }) => {
  const isUser = message.sender === MessageSender.USER;

  const bubbleClasses = isUser
    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-none'
    : 'bg-slate-700 text-slate-200 rounded-bl-none';

  const containerClasses = isUser ? 'justify-end' : 'justify-start';
  const icon = isUser ? <UserIcon className="w-6 h-6 text-indigo-300" /> : <BotIcon className="w-6 h-6 text-teal-300" />;
  const iconOrder = isUser ? 'order-2' : 'order-1';
  const textOrder = isUser ? 'order-1' : 'order-2';

  return (
    <div className={`flex items-end gap-3 my-4 animate-fade-in ${containerClasses}`}>
      <div className={`flex-shrink-0 ${iconOrder}`}>
        {icon}
      </div>
      <div className={`p-4 max-w-2xl rounded-2xl whitespace-pre-wrap shadow-lg ${bubbleClasses} ${textOrder}`}>
        {isTyping && message.text === '' ? <LoadingIndicator /> : message.text}
      </div>
    </div>
  );
};