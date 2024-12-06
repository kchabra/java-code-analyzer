const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
require('dotenv').config();

// Setup middleware
app.use(express.static('public'));
app.use(bodyParser.json());

// Function to analyze code
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
        console.error("Error:", error.response?.data || error.message);
        throw new Error("Analysis failed");
    }
}

// Extract flowchart data
function extractMermaidCode(response) {
    const mermaidMatch = response.match(/```mermaid\s*([\s\S]*?)\s*```/);
    if (mermaidMatch && mermaidMatch[1]) {
        return mermaidMatch[1].trim();
    }
    return null;
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.post('/analyze', async (req, res) => {
    try {
        const { code, explanationType, visualOutput } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Code is required' });
        }

        const validationPrompt = `Validate if input is Java code with proper syntax elements. Return only true/false.

Input:
${code}`;

        const isValidCode = await callOpenAI(validationPrompt);
        
        if (isValidCode.trim().toLowerCase() !== 'true') {
            return res.json({ 
                analysis: "<h3>Invalid Input</h3><p>The provided input does not appear to be Java code. Please submit valid Java code for analysis.</p>",
                visualAnalysis: ''
            });
        }

        let prompt = `Analyze this Java code:\n\n${code}\n\n`;
        
        if (explanationType === 'high') {
            prompt += `Provide high-level HTML analysis with:
            - Main purpose heading
            - Purpose and functionality
            - Components and roles
            - Algorithms used
            - Potential improvements`;
        } else {
            prompt += `Provide detailed HTML analysis with:
            - Code title heading
            - Line by line explanation
            - Variables and methods
            - Control flow
            - Complexity analysis
            - Best practices`;
        }

        const analysisResponse = await callOpenAI(prompt);
        let analysis = analysisResponse;
        let visualAnalysis = '';

        if (visualOutput === true) {
            const visualPrompt = `Create flowchart for this Java code using mermaid.js syntax. Include start/end nodes, method calls, and decision points.

Code:
${code}`;
            
            const visualResponse = await callOpenAI(visualPrompt);
            const mermaidCode = extractMermaidCode(visualResponse);
            
            if (mermaidCode) {
                visualAnalysis = mermaidCode;
            } else {
                console.error('Failed to generate flowchart');
                visualAnalysis = '';
            }
        }

        res.json({ analysis, visualAnalysis });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Analysis failed' });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
