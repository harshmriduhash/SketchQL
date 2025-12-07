const router = require('express').Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetchUser = require('../middleware/fetchUser'); 


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/generate', fetchUser, async (req, res) => {
    const { userPrompt } = req.body;

    if (!userPrompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {
        const model = genAI.getGenerativeModel({ 
            model:"gemini-2.5-flash", 
            generationConfig: { responseMimeType: "application/json" }
        });

        const systemPrompt = `
        You are a Database Architect. 
        The user will describe an application. You must design the database schema.

        User Description: "${userPrompt}"

        You MUST return a single JSON object with exactly two arrays: "nodes" and "edges".

        1. "nodes" format (React Flow):
        {
          "id": "table_1",
          "type": "tableNode",
          "position": { "x": 0, "y": 0 },
          "data": {
            "label": "TableName",
            "columns": [
              { "name": "id", "type": "INT", "isPK": true, "isNullable": false },
              { "name": "user_id", "type": "INT", "isPK": false, "isNullable": true } 
            ]
          }
        }

        2. "edges" format (Relationships):
        {
          "id": "e1-2",
          "source": "table_1", // The table WITH the Foreign Key
          "target": "table_2", // The table WITH the Primary Key
          
          // CRITICAL: Handles must match frontend components exactly
          "sourceHandle": "user_id-right",  // The Foreign Key column name + "-right"
          "targetHandle": "id-left",        // The Primary Key column name + "-left"
          
          "type": "smoothstep", 
          "animated": true,
          "markerEnd": { "type": "arrowclosed" },
          "data": { "label": "1:N" }
        }

        IMPORTANT RULES:
        - Create tables based on the user description.
        - ALWAYS generate edges for relationships.
        - The "sourceHandle" MUST be the Foreign Key column name ending in "-right".
        - The "targetHandle" MUST be the Primary Key column name (usually "id") ending in "-left".
        - Ensure the Foreign Key column actually exists in the source node's columns list.
        - RESPONSE MUST BE RAW JSON.
        `;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        let text = response.text();
        
  
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      

        const jsonResult = JSON.parse(text);
        
        res.json(jsonResult);

    } catch (error) {
        console.error("Gemini AI Error Details:", error);
        res.status(500).json({ error: "Failed to generate schema. Check server console for details." });
    }
});

module.exports = router;