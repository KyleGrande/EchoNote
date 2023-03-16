import openai from "openai";

const apiKey = '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';

openai.apiKey = apiKey;

const generateSummary = async (text) => {
  try {
    const response = await openai.Completion.create({
      engine: "davinci-codex",
      prompt: `Please summarize the following text as if it were notes for a class:\n\n${text}`,
      max_tokens: 100,
      n: 1,
      stop: null,
      temperature: 0.7,
    });

    return response.choices[0].text.trim();
  } catch (error) {
    console.error("Error generating summary:", error);
    return "";
  }
};

export default generateSummary;
