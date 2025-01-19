const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Google Generative AI client with your API key
const genAI = new GoogleGenerativeAI("AIzaSyAYMKoVfDVgIAdZUPah5pE3tDAPKGhGfGE");

// Get the generative model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Define the prompt
const prompt = "Explain how AI works";

// Define an asynchronous function to generate a response
const generateResponse = async () => {
    try {
        const result = await model.generateContent(prompt); // Await the API call
        console.log(result.response.text()); // Access and log the response text
    } catch (error) {
        console.error("Error generating response:", error);
    }
};

// Call the asynchronous function
generateResponse();
