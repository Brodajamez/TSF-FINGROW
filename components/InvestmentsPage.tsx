import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';

interface GroundingSource {
  uri: string;
  title: string;
}

// Ensure API_KEY is handled as per guidelines
const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
}

const InvestmentsPage: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ text: string; sources: GroundingSource[] } | null>(null);
    
    const predefinedQueries = [
        "What are some popular investment platforms in Nigeria?",
        "Explain ETFs for beginners.",
        "What are the current trends in sustainable investing?",
        "Risks and rewards of cryptocurrency."
    ];

    const handleQuery = async (prompt: string) => {
        if (!prompt.trim() || !ai) {
            if(!ai) setError("API Key not configured. This feature is unavailable.");
            return;
        };

        setIsLoading(true);
        setError(null);
        setResult(null);
        setQuery(prompt);

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    tools: [{googleSearch: {}}],
                },
            });

            const text = response.text;
            const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
            const sourcesMap = new Map<string, GroundingSource>();
            rawChunks.forEach((chunk: any) => {
                if (chunk.web && chunk.web.uri && chunk.web.title) {
                    sourcesMap.set(chunk.web.uri, {uri: chunk.web.uri, title: chunk.web.title});
                }
            });
            const sources = Array.from(sourcesMap.values());

            setResult({ text, sources });

        } catch (err) {
            console.error("Error fetching investment info:", err);
            setError("Sorry, I couldn't fetch the information. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleQuery(query);
    };
    
    if (!apiKey) {
        return (
             <div className="space-y-6">
                <h1 className="text-3xl font-bold text-slate-900">Investment Insights</h1>
                 <Card>
                    <p className="text-center text-red-600">The AI Investments feature is currently unavailable because the API key has not been configured.</p>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900">Investment Insights</h1>
            <p className="text-slate-600">Explore investment topics with up-to-date, AI-powered information grounded in web search results.</p>
            
            <Card>
                <form onSubmit={handleSubmit} className="flex items-center space-x-2 mb-4">
                    <div className="flex-grow">
                        <Input 
                            id="investment-query"
                            label="Ask an investment question"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g., How to start investing in stocks?"
                        />
                    </div>
                    <Button type="submit" disabled={isLoading} className="self-end">
                        {isLoading ? 'Searching...' : 'Ask'}
                    </Button>
                </form>
                <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-slate-500 self-center">Or try:</span>
                    {predefinedQueries.map(q => (
                        <button key={q} onClick={() => handleQuery(q)} disabled={isLoading} className="text-sm bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-1 px-3 rounded-full transition-colors disabled:opacity-50">
                            {q}
                        </button>
                    ))}
                </div>
            </Card>

            {isLoading && (
                <Card>
                    <div className="flex justify-center items-center space-x-2">
                         <div className="dot-flashing"></div>
                         <p className="text-slate-600">Searching for the latest information...</p>
                    </div>
                     <style>{`
                        .dot-flashing {
                          position: relative;
                          width: 10px; height: 10px;
                          border-radius: 5px;
                          background-color: #0284c7;
                          color: #0284c7;
                          animation: dotFlashing 1s infinite linear alternate;
                          animation-delay: .5s;
                        }
                        .dot-flashing::before, .dot-flashing::after {
                          content: '';
                          display: inline-block;
                          position: absolute;
                          top: 0;
                        }
                        .dot-flashing::before {
                          left: -15px;
                          width: 10px; height: 10px;
                          border-radius: 5px;
                          background-color: #0284c7;
                          color: #0284c7;
                          animation: dotFlashing 1s infinite alternate;
                          animation-delay: 0s;
                        }
                        .dot-flashing::after {
                          left: 15px;
                          width: 10px; height: 10px;
                          border-radius: 5px;
                          background-color: #0284c7;
                          color: #0284c7;
                          animation: dotFlashing 1s infinite alternate;
                          animation-delay: 1s;
                        }
                        @keyframes dotFlashing {
                          0% { background-color: #075985; }
                          50%, 100% { background-color: #bae6fd; }
                        }
                      `}</style>
                </Card>
            )}

            {error && <Card><p className="text-center text-red-600">{error}</p></Card>}

            {result && (
                <Card title={`Results for "${query}"`}>
                    <div className="prose max-w-none text-slate-800">
                        {result.text.split('\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                    </div>
                    {result.sources.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-lg font-bold border-b pb-2 mb-3">Sources</h3>
                            <ul className="list-decimal list-inside space-y-2">
                                {result.sources.map(source => (
                                    <li key={source.uri}>
                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800 hover:underline">
                                            {source.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                     <p className="text-xs text-slate-400 mt-6 text-center italic">
                        Disclaimer: This AI-generated information is for educational purposes only and is not financial advice. Always conduct your own research or consult with a qualified professional.
                    </p>
                </Card>
            )}
        </div>
    );
};

export default InvestmentsPage;
