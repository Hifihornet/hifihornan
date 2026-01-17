import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Bot, User, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  quickReplies?: string[];
  isTyping?: boolean;
}

interface ChatbotResponse {
  text: string;
  quickReplies?: string[];
  category?: string;
}

const HiFiKnowledgeBase = {
  // Vanliga frågor om HiFi
  'vad är hifi': 'HiFi (High Fidelity) är högkvalitativ ljudåtergivning som strävar efter att återskapa ljud så nära originalet som möjligt. Det inkluderar allt från källan till hörlurararna.',
  
  'vilka högtalare är bäst': 'Det beror på budget, rum och personlig preferens. För nybörjare rekommenderar jag Dali Spektor, Q Acoustics 3030i eller KEF Q350. För mer erfarna kan B&W, Focal eller Dynaudio vara bra val.',
  
  'hur kopplar jag förstärkare': 'Du behöver en förstärkare, högtalare, signalkablar och en ljudkälla. Anslut ljudkällan till förstärkarens input, och högtalarna till output. Använd alltid högtalarkablar av god kvalitet!',
  
  'vad är bi-wiring': 'Bi-wiring innebär att använda två separata kablar från förstärkaren till varje högtalare - en för bas/mellanregister och en för diskant. Det kan ge bättre ljudkvalitet i vissa system.',
  
  'hur mycket kostar bra hifi': 'Ett bra entry-system kostar 5-10k kr, medan high-end kan kosta 50k+ kr. Kom ihåg att källan (spelare/streamer) och högtalare oftast är viktigast att investera i.',
  
  'vad är streaming': 'Streaming är att spela musik direkt från internet utan att ladda ner filer. Tjänster som Spotify, Tidal och Qobuz erbjuder streaming i olika ljudkvaliteter.',
  
  'hur ställer jag in högtalare': 'Placera högtalarna i en triangel med lyssningspositionen. Avståndet mellan högtalarna ska vara ungefär lika med avståndet till lyssningspositionen. Undvik att placera dem för nära väggar.',
  
  'vad är en dac': 'En DAC (Digital-to-Analog Converter) omvandlar digitala signaler till analoga. Alla digitala ljudkällor behöver en DAC för att anslutas till en analog förstärkare.',
  
  'hur testar jag högtalare': 'Lyssna på musik du känner väl. Testa olika positionering. Jämför med referens-spår. Tänk på bas, mellanregister, diskant, ljudbild och dynamik.',
  
  'vad är analog vs digital': 'Analog (vinyl) har varm, organisk klang med brus och crackle. Digital är renare, tystare och mer praktiskt. Båda har sina fördelar - välj baserat på vad du värdesätter mest.'
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hej! Jag är HiFiHornans AI-assistent. Jag kan hjälpa dig med allt om HiFi-utrustning, från att välja högtalare till felsökning. Vad kan jag hjälpa dig med?',
      sender: 'bot',
      timestamp: new Date(),
      quickReplies: ['Välja högtalare', 'Koppla förstärkare', 'Budget-rekommendationer', 'Felsökning']
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useMobileOptimization();

  const commonQuestions = [
    'Vad är HiFi?',
    'Vilka högtalare är bäst?',
    'Hur kopplar jag förstärkare?',
    'Vad är bi-wiring?',
    'Hur mycket kostar bra HiFi?',
    'Vad är streaming?',
    'Hur ställer jag in högtalare?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string): ChatbotResponse => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Sök i kunskapsbasen
    for (const [question, answer] of Object.entries(HiFiKnowledgeBase)) {
      if (lowerMessage.includes(question) || question.includes(lowerMessage)) {
        const quickReplies = generateQuickReplies(answer);
        return { text: answer, quickReplies };
      }
    }

    // Generiska svar baserade på nyckelord
    if (lowerMessage.includes('budget') || lowerMessage.includes('pris') || lowerMessage.includes('kostar')) {
      return {
        text: 'Budget är en viktig faktor! För 5-10k kr får du ett bra entry-system. För 10-25k kr kan du få riktigt bra kvalitet. Berätta gärna din budget och vad du lyssnar på, så kan jag ge mer specifika rekommendationer.',
        quickReplies: ['Under 10k kr', '10-25k kr', '25-50k kr', 'Över 50k kr']
      };
    }

    if (lowerMessage.includes('högtalare') || lowerMessage.includes('speakers')) {
      return {
        text: 'Högtalare är personliga! Berätta gärna: 1) Din budget, 2) Rumstorlek, 3) Vilken musik du lyssnar på, 4) Om du föredrar golvhögtalare eller bokhyllshögtalare.',
        quickReplies: ['Golvhögtalare', 'Bokhyllshögtalare', 'Aktiva högtalare', 'Studio-monitorer']
      };
    }

    if (lowerMessage.includes('förstärkare') || lowerMessage.includes('amplifier')) {
      return {
        text: 'Förstärkare är hjärtat i systemet! Behöver du en rörförstärkare till dina högtalare, eller en förstärkare med inbyggd DAC för streaming? Berätta gärna vilka högtalare du har eller planerar att köpa.',
        quickReplies: ['Rörförstärkare', 'Integrerad förstärkare', 'Förstärkare med DAC', 'Headphone amp']
      };
    }

    if (lowerMessage.includes('tack') || lowerMessage.includes('tackar')) {
      return {
        text: 'Varsågod! Det var en glädje att hjälpa till. Kom tillbaka om du har fler frågor om HiFi!',
        quickReplies: ['Ny fråga', 'Avsluta chatten']
      };
    }

    // Fallback svar
    return {
      text: 'Det är en intressant fråga! Som HiFi-entusiast älskar jag att diskutera ljud. Kan du ge mig lite mer detaljer så kan jag ge ett bättre svar? Du kan också fråga mig om specifika märken, budget eller tekniska koncept.',
      quickReplies: ['Budget', 'Specifikt märke', 'Teknisk förklaring', 'Köpråd']
    };
  };

  const generateQuickReplies = (answer: string): string[] => {
    // Generera relevanta snabbsvar baserat på svaret
    if (answer.includes('budget') || answer.includes('pris')) {
      return ['Budget-rekommendationer', 'Entry vs High-end', 'Begagnat vs Nytt'];
    }
    if (answer.includes('högtalare')) {
      return ['Golvhögtalare', 'Bokhyllshögtalare', 'Aktiva högtalare'];
    }
    if (answer.includes('förstärkare')) {
      return ['Rörförstärkare', 'Integrerad förstärkare', 'Förstärkare vs Receiver'];
    }
    return ['Mer information', 'Annan fråga', 'Tack'];
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setShowSuggestions(false);
    setIsTyping(true);

    // Simulera bot-tänkning
    setTimeout(() => {
      const botResponse = generateBotResponse(inputText);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse.text,
        sender: 'bot',
        timestamp: new Date(),
        quickReplies: botResponse.quickReplies
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // 1-2 sekunders delay
  };

  const handleQuickReply = (reply: string) => {
    setInputText(reply);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleFeedback = (messageId: string, isPositive: boolean) => {
    // Här skulle du skicka feedback till backend för att förbättra chatboten
    console.log(`Feedback for message ${messageId}: ${isPositive ? 'positive' : 'negative'}`);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 ${isMobile ? 'w-14 h-14 rounded-full' : 'px-4 py-2'} bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105`}
      >
        <MessageCircle className="w-5 h-5" />
        {!isMobile && <span className="ml-2">Fråga AI</span>}
      </Button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-40 ${isMobile ? 'w-[calc(100vw-2rem)] h-[70vh]' : 'w-96 h-[600px]'} bg-background border border-border rounded-lg shadow-2xl flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-primary/5">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-sm">HiFi AI-assistent</h3>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className={message.sender === 'bot' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>
                {message.sender === 'bot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </AvatarFallback>
            </Avatar>
            <div className={`max-w-[80%] ${message.sender === 'user' ? 'text-right' : ''}`}>
              <div
                className={`rounded-lg px-3 py-2 text-sm ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {message.text}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {new Date(message.timestamp).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {message.sender === 'bot' && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback(message.id, true)}
                      className="h-6 w-6 p-0 text-green-500 hover:text-green-600"
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback(message.id, false)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Quick Replies */}
              {message.quickReplies && message.sender === 'bot' && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {message.quickReplies.map((reply, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickReply(reply)}
                      className="text-xs h-7 px-2"
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-secondary rounded-lg px-3 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground mb-2">Vanliga frågor:</p>
          <div className="flex flex-wrap gap-1">
            {commonQuestions.slice(0, 4).map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickReply(question)}
                className="text-xs h-7 px-2"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            placeholder="Skriv din fråga..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            size="sm"
            className="px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
