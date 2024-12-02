const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
require('dotenv').config();

// Middleware
app.use(express.static('public'));
app.use(bodyParser.json());

// OpenAI API Integration
async function callOpenAI(prompt) {
    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            }
        );
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Error calling OpenAI API:", error.response?.data || error.message);
        throw new Error("Failed to connect to OpenAI API");
    }
}

// Function to extract Mermaid code from response
function extractMermaidCode(response) {
    // Look for content between ```mermaid and ``` tags
    const mermaidMatch = response.match(/```mermaid\s*([\s\S]*?)\s*```/);
    if (mermaidMatch && mermaidMatch[1]) {
        return mermaidMatch[1].trim();
    }
    return null;
}

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

// Handle POST request for code analysis
app.post('/analyze', async (req, res) => {
    try {
        const { code, explanationType, visualOutput } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Code is required' });
        }

        // Create prompt based on user settings
        let prompt = `You are a Java code analysis expert. Analyze the following Java code:\n\n${code}\n\n`;
        
        if (explanationType === 'high') {
            prompt += `Provide a high-level analysis in HTML format including:
            1. A clear <h3> heading with the code's main purpose
            2. An organized <ul> list containing:
               - Purpose and functionality
               - Main components and their roles
               - Key algorithms or patterns used
               - Potential improvements or suggestions
            Make the analysis clear and concise, focusing on the big picture.`;
        } else {
            prompt += `Provide a detailed line-by-line analysis in HTML format including:
            1. A clear <h3> heading with the code's title
            2. An organized <ul> list containing:
               - Detailed explanation of each significant code line
               - Variables, methods, and their purposes
               - Control flow and logic explanation
               - Time and space complexity analysis
               - Best practices and potential improvements
            Use <code> tags for code snippets and maintain clear formatting.`;
        }

        // Get initial analysis from OpenAI
        const analysisResponse = await callOpenAI(prompt);
        let analysis = analysisResponse;
        let visualAnalysis = '';

        // If visual output is requested, get flowchart description
        if (visualOutput === true) {
            const visualPrompt = `Create a mermaid.js flowchart that visualizes the logic and control flow of this Java code. Follow these strict requirements:

1. Start with 'graph TD' (top-down graph)
2. Use proper mermaid.js syntax for nodes and connections:
   - Each node should have a unique ID and label: e.g., A[Start]
   - Use --> for connections
   - Use proper decision diamond syntax: e.g., B{Check condition}
3. Include these elements:
   - Start and End nodes
   - Method calls
   - Decision points with Yes/No branches
   - Return statements

Return ONLY the mermaid.js flowchart code wrapped in triple backticks with 'mermaid' language specifier, nothing else.

Java code to visualize:
${code}`;
            
            const visualResponse = await callOpenAI(visualPrompt);
            const mermaidCode = extractMermaidCode(visualResponse);
            
            if (mermaidCode) {
                visualAnalysis = mermaidCode;
            } else {
                console.error('Failed to extract Mermaid code from response:', visualResponse);
                visualAnalysis = '';
            }
        }

        res.json({ analysis, visualAnalysis });
    } catch (error) {
        console.error('Error analyzing code:', error);
        res.status(500).json({ error: 'Failed to analyze code' });
    }
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
