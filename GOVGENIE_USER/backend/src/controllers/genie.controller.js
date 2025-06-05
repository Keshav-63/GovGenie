import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY 
);


export const chatWithGenie = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ reply: "Please enter a valid message." });
    }

  
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

   
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    return res.json({
      reply: text?.trim() || "Sorry, I couldn't generate a response.",
    });
  } catch (error) {
    console.error("Error in chatWithGenie:", error);
    return res
      .status(500)
      .json({ reply: `An error occurred: ${error.message}` });
  }
};


