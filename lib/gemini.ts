import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

export const initializeGemini = () => {
    if (!API_KEY) {
        console.error("Gemini API Key is missing. Please check your .env file.");
        return;
    }
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-pro" });
};

// System Prompt ensuring the Persona
const SYSTEM_PROMPT = `
Você é uma Inteligência Artificial Jurídica Especializada, integrada ao sistema 'E-Lance'.
Sua missão é auxiliar administradores e franqueados com dúvidas avançadas sobre:
1. Lei do Inquilinato (Brasil).
2. Leilões de Imóveis (Judiciais e Extrajudiciais).
3. Penhoras e Processos Cíveis relacionados a imóveis.

Diretrizes:
- Respostas devem ser fundamentadas na legislação brasileira vigente (cite artigos quando relevante).
- Use linguagem profissional, clara e precisa.
- Se não tiver certeza absoluta sobre um caso complexo, recomende consultar um advogado especializado.
- Mantenha o contexto da conversa anterior.
- Seja útil e direto.
`;

export const sendMessageToGemini = async (history: { role: string; content: string }[], newMessage: string) => {
    if (!model) initializeGemini();
    if (!model) throw new Error("API Key inválida ou cliente não inicializado.");

    try {
        // Prepare history for Gemini format
        const chatHistory = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: "System Requirement: " + SYSTEM_PROMPT }]
                },
                {
                    role: 'model',
                    parts: [{ text: "Entendido. Atuarei como o Assistente Jurídico Especializado em Direito Imobiliário e Leilões." }]
                },
                ...chatHistory
            ],
        });

        const result = await chat.sendMessage(newMessage);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Erro ao chamar Gemini:", error);
        throw error;
    }
};
