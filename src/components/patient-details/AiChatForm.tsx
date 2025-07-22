import React, { useState, useEffect, useRef } from "react";
import { fetchAIRecommendation } from "@/lib/api/getAIRecommendation";
import { Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Patient, Diagnosis, Prescription } from "@/lib/definitions";

interface AiChatFormProps {
  patient: Patient | null;
  diagnosis: Diagnosis | null;
  prescription: Prescription | null;
  startOnMount?: boolean;
}

export default function AiChatForm({ patient, diagnosis, prescription, startOnMount }: AiChatFormProps) {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const contextRef = useRef<string>("");
  const sentInitialRef = useRef(false);
  const aiInitialResponseRef = useRef<string>("");

  useEffect(() => {
    if (!startOnMount || sentInitialRef.current) return;
    // Compose context summary
    let context = "";
    if (patient) {
      context += `Patient Info: Name: ${patient.firstName} ${patient.lastName}, Age: ${patient.age}, Gender: ${patient.gender}, Address: ${patient.address || "N/A"}. `;
    }
    if (diagnosis) {
      context += `Diagnosis: Type: ${diagnosis.diagnosisType || "N/A"}, Description: ${diagnosis.description || "N/A"}, GMFCS Level: ${diagnosis.gmfcsLevel || "N/A"}, Recommendation: ${diagnosis.recommendation || "N/A"}. `;
    }
    if (prescription) {
      context += `Prescription: Summary: ${prescription.diagnosisSummary || "N/A"}, Orthotic Type: ${prescription.orthoticType || "N/A"}, Notes: ${prescription.notes || "N/A"}.`;
    }
    contextRef.current = context;
    // Show spinner and send hidden initial message to AI
    if (context) {
      setLoading(true);
      fetchAIRecommendation("", context).then((aiResponse) => {
        aiInitialResponseRef.current = aiResponse;
        setMessages((msgs) => [...msgs, { sender: "ai", text: aiResponse }]);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    }
    sentInitialRef.current = true;
    // Only run on mount or when context changes
  }, [patient, diagnosis, prescription, startOnMount]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { sender: "user", text: input }]);
    setLoading(true);
    try {
      const prompt = contextRef.current + "\nUser: " + input;
      const aiResponse = await fetchAIRecommendation("", prompt);
      setMessages((msgs) => [...msgs, { sender: "ai", text: aiResponse }]);
    } catch {
      setMessages((msgs) => [...msgs, { sender: "ai", text: "Sorry, we could not fetch the AI advice at the moment." }]);
    }
    setLoading(false);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full border rounded p-4 bg-white min-h-[400px]">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.sender === "user" ? "flex justify-end" : "flex justify-start"}>
            {msg.sender === "ai" ? (
              <div className="flex items-start gap-2 max-w-[80%] bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 text-gray-900">
                <Bot className="w-5 h-5 mt-1 text-blue-400 shrink-0" />
                <div className="prose prose-sm prose-blue break-words text-left w-full">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="max-w-[80%] bg-primary text-white rounded-xl px-4 py-3 font-medium shadow-md">
                {msg.text}
              </div>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="flex gap-2 items-center">
        <input
          className="flex-1 border rounded p-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask AI about prescriptions..."
          disabled={loading}
        />
        {loading ? (
          <span className="flex items-center justify-center w-10 h-10">
            <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </span>
        ) : (
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={!input.trim()}>
            Send
          </button>
        )}
      </form>
    </div>
  );
} 