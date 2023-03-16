const express = require("express");
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: "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",
  });
  
const openai = new OpenAIApi(configuration);



const app = express();
const port = 3001;


app.use(cors());
app.use(express.json());

app.post("/api/summarize", async (req, res) => {
    try {
      const text = req.body.text;
  
      let response;
  
      try {
        response = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: `If you see something that may be a reference make it its own line and if you see dates do the same\n\nCreate study notes for following text as if it was for a class:\n\n${text}`,
          temperature: 0.3,
          max_tokens: 100,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        });

        console.log('OpenAI API response:', response);

      } catch (error) {
        console.error("Error calling OpenAI API:", error.message);
        console.error("Response object:", error.response && error.response.toJSON ? error.response.toJSON() : error.response);
        return res.status(500).json({ error: "Failed to generate summary" });
      }
  
      const summary = response.data.choices[0].text.trim(); // Change this line
      res.json({ summary });
    } catch (error) {
      console.error("Error generating summary:", error.message);
      res.status(500).json({ error: "Failed to generate summary" });
    }
});
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
  