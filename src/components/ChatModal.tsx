import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Send, X, MessageSquare, User, Clock } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';

interface ChatModalProps {
  recipientId: string;
  recipientName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  recipientId,
  recipientName,
  isOpen,
  onClose,
}) => {
  const { chatMessages, sendChatMessage, currentUser } = useApp();
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  // Filter messages for this conversation
  const messages = chatMessages.filter(
    (m) =>
      (m.senderId === currentUser.id && m.recipientId === recipientId) ||
      (m.senderId === recipientId && m.recipientId === currentUser.id)
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendChatMessage(recipientId, inputText);
    setInputText('');
    triggerHaptic('light');
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col h-[520px] max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#064e3b] p-4 text-white flex items-center justify-between border-b border-amber-400/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-400 text-stone-900 flex items-center justify-center font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-200">{recipientName}</h4>
              <span className="text-[10px] text-emerald-200/90 block">محادثة مباشرة مع المشرف</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-300 hover:text-white hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-[#fdfbf7] text-xs">
          {messages.length === 0 ? (
            <div className="text-center py-16 text-stone-400 space-y-1">
              <MessageSquare className="w-8 h-8 mx-auto text-stone-300" />
              <p>لا توجد رسائل سابقة في هذه المحادثة</p>
              <p className="text-[11px] text-stone-500">ابدأ بإرسال استفسارك أو طلبك للمشرف</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl shadow-2xs leading-relaxed ${
                      isMine
                        ? 'bg-emerald-900 text-white rounded-tr-none'
                        : 'bg-white text-stone-900 border border-stone-200 rounded-tl-none'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <span
                      className={`text-[9px] block mt-1 font-mono ${
                        isMine ? 'text-emerald-300' : 'text-stone-400'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString('ar-EG', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-stone-200 flex gap-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="اكتب رسالتك للشيخ والمشرف..."
            className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 bg-stone-50"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 active:scale-95"
          >
            <Send className="w-3.5 h-3.5 -rotate-12" />
            <span>إرسال</span>
          </button>
        </form>
      </div>
    </div>
  );
};
