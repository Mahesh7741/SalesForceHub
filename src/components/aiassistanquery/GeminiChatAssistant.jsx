'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import { Avatar } from "../ui/avatar";
import { Loader2, Send, Bot, User } from "lucide-react";
import { toast } from "sonner";

const GeminiChatAssistant = ({ onQueryGenerated }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Send message to Gemini API
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to chat
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    
    setIsLoading(true);

    try {
      // Prepare a prompt that asks Gemini to create a SOQL query
      const enhancedPrompt = `Generate a Salesforce SOQL query for this request: ${userMessage}`;
      
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: enhancedPrompt }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate response');
      }

      // Add AI response to chat
      setMessages([
        ...newMessages, 
        { 
          role: 'assistant', 
          content: 'Here\'s the SOQL query based on your request:',
          query: result.query 
        }
      ]);
      
      // Send the generated query to parent component
      if (onQueryGenerated && result.query) {
        onQueryGenerated(result.query);
      }
      
    } catch (err) {
      toast.error('Error: ' + (err.message || 'Failed to get response'));
      // Add error message to chat
      setMessages([
        ...newMessages,
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error while generating your query. Please try again.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract SOQL query from the chat messages
  const extractQuery = (message) => {
    if (message.query) {
      return message.query;
    }
    
    // For older messages that might not have the query property
    const match = message.content.match(/```(?:sql|soql)?\s*(SELECT[\s\S]*?)```/i);
    return match ? match[1].trim() : null;
  };

  // Use a query from the chat
  const useQuery = (query) => {
    if (onQueryGenerated && query) {
      onQueryGenerated(query);
      toast.success('Query selected and ready to execute!');
    }
  };

  return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-500" />
          Gemini Query Assistant
        </CardTitle>
        <CardDescription>
          Chat with Gemini AI to create and refine your Salesforce queries
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-center">
            <div>
              <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Start a conversation to generate Salesforce SOQL queries</p>
              <p className="text-sm mt-2">Try asking: "Show me the top 10 accounts" or "Find all contacts in California"</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar className={`h-8 w-8 ${message.role === 'user' ? 'bg-blue-100' : 'bg-neutral-100'}`}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Bot className="h-4 w-4 text-neutral-500" />
                  )}
                </Avatar>
                
                <div>
                  <div className={`rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {message.content}
                  </div>
                  
                  {message.role === 'assistant' && message.query && (
                    <div className="mt-2">
                      <div className="bg-gray-50 border rounded-md p-2 font-mono text-xs overflow-x-auto">
                        {message.query}
                      </div>
                      <div className="mt-1 flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs" 
                          onClick={() => useQuery(message.query)}
                        >
                          Use This Query
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      
      <CardFooter className="border-t p-3">
        <form onSubmit={sendMessage} className="flex w-full gap-2">
          <Input
            placeholder="Ask about Salesforce data you need..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default GeminiChatAssistant;