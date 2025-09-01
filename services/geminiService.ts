
import { GoogleGenAI, Chat } from '@google/genai';
import { Transaction } from '../types';

if (!process.env.API_KEY) {
    // In a real app, you'd want to handle this more gracefully.
    // For this environment, we assume API_KEY is set.
    console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const systemInstruction = `You are 'Finley', a friendly and insightful AI financial advisor for the TSF-FinGrow app. Your goal is to provide clear, actionable, and encouraging financial advice based on the user's transaction data. Analyze their spending, identify trends, and help them understand their financial habits to make smarter decisions. Be positive, empathetic, and avoid judgmental language. Your tone should be supportive, like a knowledgeable friend. Do not provide professional, legally-binding financial advice, but rather educational guidance and suggestions. When asked, analyze the provided JSON data of transactions to answer user questions.`;

export const createAdvisorChat = (): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
        },
    });
};

export const generateTransactionsContext = (transactions: Transaction[]): string => {
    if (transactions.length === 0) {
        return "The user has not added any transactions yet.";
    }
    const recentTransactions = transactions.slice(0, 50); // Limit context size
    return `Here is a summary of the user's recent transactions in JSON format: ${JSON.stringify(recentTransactions)}`;
};