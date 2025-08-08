export const fetchAIRecommendation = async (_apiKey: string, prompt: string) => {
  try {
    const response = await fetch("/api/ai/recommendation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.content as string;
  } catch (error) {
    console.error("Error fetching AI response:", error);
    return "Sorry, we could not fetch the AI advice at the moment.";
  }
};