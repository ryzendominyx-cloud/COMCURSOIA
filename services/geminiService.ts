
import { GoogleGenAI, Type } from "@google/genai";
import { getCachedLesson, saveCachedLesson } from './storageService';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-3-flash-preview';

// Prompt ultra-conciso para reduzir tokens de entrada
const SYSTEM_SPEED_PROMPT = "Aja como tutor técnico de concursos. Responda apenas o JSON solicitado, sem introduções.";

export const generateStudyPlan = async (subject: string, targetContest: string): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Gere JSON com 10 tópicos essenciais de "${subject}" para "${targetContest}".`,
            config: {
                systemInstruction: SYSTEM_SPEED_PROMPT,
                responseMimeType: 'application/json',
                maxOutputTokens: 400,
                thinkingConfig: { thinkingBudget: 0 },
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { topics: { type: Type.ARRAY, items: { type: Type.STRING } } },
                    required: ["topics"]
                }
            }
        });
        const parsed = JSON.parse(response.text || "{}");
        return parsed.topics || ["Introdução ao Tema"];
    } catch (e) {
        return ["Fundamentos", "Legislação Aplicada", "Resumo Geral"];
    }
};

export const generateLesson = async (subject: string, topic: string, targetContest: string): Promise<string> => {
    const cached = getCachedLesson(subject, topic);
    if (cached) return cached;

    try {
        const response = await ai.models.generateContent({ 
            model: MODEL_NAME, 
            contents: `Aula Markdown direta sobre "${topic}" para "${targetContest}". Use tabelas e mnemônicos. Curto e denso.`,
            config: { 
                maxOutputTokens: 1000,
                thinkingConfig: { thinkingBudget: 0 } 
            }
        });
        const text = response.text || "Conteúdo indisponível.";
        saveCachedLesson(subject, topic, text);
        return text;
    } catch (e) { return "Erro de conexão."; }
};

// NOVO: Gera um lote de questões para economizar tokens de overhead
export const generateQuizBatch = async (subject: string, topic: string, targetContest: string, count: number = 5): Promise<any[]> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Gere um array JSON com ${count} questões de múltipla escolha nível concurso sobre "${topic}" para "${targetContest}".`,
            config: {
                systemInstruction: SYSTEM_SPEED_PROMPT,
                responseMimeType: 'application/json',
                maxOutputTokens: 2000,
                thinkingConfig: { thinkingBudget: 0 },
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING },
                                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    answerIndex: { type: Type.INTEGER },
                                    explanation: { type: Type.STRING }
                                },
                                required: ["question", "options", "answerIndex", "explanation"]
                            }
                        }
                    },
                    required: ["questions"]
                }
            }
        });
        const parsed = JSON.parse(response.text || "{}");
        return parsed.questions || [];
    } catch (e) { return []; }
};

export const generateRandomQuestion = async (subject: string, targetContest: string): Promise<any> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `1 questão JSON de "${subject}" para "${targetContest}".`,
            config: {
                systemInstruction: SYSTEM_SPEED_PROMPT,
                responseMimeType: 'application/json',
                maxOutputTokens: 400,
                thinkingConfig: { thinkingBudget: 0 },
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        answerIndex: { type: Type.INTEGER },
                        explanation: { type: Type.STRING }
                    },
                    required: ["question", "options", "answerIndex", "explanation"]
                }
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (e) { return null; }
};
