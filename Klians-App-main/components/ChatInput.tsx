import React, { useState, useRef } from 'react';
import { Button } from './ui/Button';
import { ICONS } from '../constants';

const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;

interface ChatInputProps {
    onSendMessage: (message: string) => void;
}

const FormatButton: React.FC<{ onClick: () => void, children: React.ReactNode, title: string }> = ({ onClick, children, title }) => (
    <button
        type="button"
        onClick={onClick}
        onMouseDown={e => e.preventDefault()}
        className="p-2 rounded text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
        title={title}
    >
        {children}
    </button>
);

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [showFormatTools, setShowFormatTools] = useState(false);

    const handleInput = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = `${scrollHeight}px`;
            // Show formatting tools only when user starts typing
            if(textarea.value.length > 0 && !showFormatTools) {
                setShowFormatTools(true);
            } else if (textarea.value.length === 0 && showFormatTools) {
                setShowFormatTools(false);
            }
        }
    };

    const handleSendMessage = () => {
        if (message.trim()) {
            onSendMessage(message.trim());
            setMessage('');
            setShowFormatTools(false);
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const applyFormat = (format: 'bold' | 'italic' | 'underline') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = message.substring(start, end);

        if (!selectedText) {
            textarea.focus();
            return;
        }

        const formatChars: Record<typeof format, string> = {
            bold: '**',
            italic: '*',
            underline: '__',
        };
        const chars = formatChars[format];
        const formattedText = `${chars}${selectedText}${chars}`;
        
        const newMessage = message.substring(0, start) + formattedText + message.substring(end);
        
        setMessage(newMessage);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + chars.length, end + chars.length);
        }, 0);
    };

    return (
        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <div className={`bg-slate-100 dark:bg-slate-700 rounded-2xl p-2 transition-all duration-300 ${showFormatTools ? 'pb-1' : ''}`}>
                 {showFormatTools && (
                    <div className="flex items-center space-x-1 border-b border-slate-200 dark:border-slate-600 pb-1 mb-1 px-1">
                        <FormatButton onClick={() => applyFormat('bold')} title="Bold">{ICONS.bold}</FormatButton>
                        <FormatButton onClick={() => applyFormat('italic')} title="Italic">{ICONS.italic}</FormatButton>
                        <FormatButton onClick={() => applyFormat('underline')} title="Underline">{ICONS.underline}</FormatButton>
                    </div>
                 )}
                <div className="flex items-end space-x-2">
                    <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 self-end mb-1">{ICONS.attachment}</button>
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onInput={handleInput}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent py-2.5 resize-none focus:outline-none max-h-40 text-sm"
                    />
                    <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 self-end mb-1">{ICONS.smile}</button>
                    <Button onClick={handleSendMessage} className="rounded-full !p-3 aspect-square self-end"><SendIcon /></Button>
                </div>
            </div>
        </div>
    );
};
