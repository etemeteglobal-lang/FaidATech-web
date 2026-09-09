require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// Environment Variables ያንብቡ
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; 
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID; 

// API Keys ከ .env ተከፍለው ወደ Array ይገባሉ
const API_KEYS = process.env.GEMINI_KEYS ? process.env.GEMINI_KEYS.split(',') : [];

let currentKeyIndex = 0;

function getApiKey() {
    return API_KEYS[currentKeyIndex];
}

function rotateApiKey() {
    if (API_KEYS.length > 1) {
        currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    }
}

// Telegram Message Dispatcher
async function sendToTelegram(userQuery, botResponse) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

    const messageText = `🚀 New Lead / Order Alert (FaidATech AI)\n\n` +
                        `👤 User Query:\n${userQuery}\n\n` +
                        `🤖 AI Response:\n${botResponse}\n\n` +
                        `📅 Date: ${new Date().toLocaleString()}`;

    try {
        const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: messageText
            })
        });
        const tgData = await tgRes.json();
        console.log("Telegram Dispatch Status:", tgData.ok ? "Success" : tgData.description);
    } catch (e) {
        console.error("Telegram Dispatch Exception:", e);
    }
}

app.post('/api/chat', async (req, res) => {
    const { contents, system_instruction } = req.body;

    if (API_KEYS.length === 0) {
        return res.status(500).json({ error: "No API keys configured on server." });
    }

    let attempts = 0;
    const maxAttempts = API_KEYS.length;

    while (attempts < maxAttempts) {
        try {
            const apiKey = getApiKey();
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction,
                    contents,
                    generationConfig: {
                        maxOutputTokens: 1000,
                        temperature: 0.3
                    }
                })
            });

            const data = await response.json();

            if (response.ok && !data.error) {
                const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                
                const lastUserMessage = contents[contents.length - 1]?.parts[0]?.text || "";
                const hasPhoneNum = /\d{9,}/.test(lastUserMessage);
                const isOrderTag = textResponse.includes('[ORDER_READY]') || textResponse.includes('[ORDERREADY]');

                if (hasPhoneNum || isOrderTag) {
                    sendToTelegram(lastUserMessage, textResponse);
                }

                return res.json(data);
            }

            if (data.error && (data.error.code === 429 || data.error.status === 'RESOURCE_EXHAUSTED')) {
                rotateApiKey();
                attempts++;
            } else {
                return res.status(400).json(data);
            }
        } catch (error) {
            console.error("Server API Exception:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    res.status(429).json({ error: { message: "All API keys are currently rate-limited." } });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FaidATech AI Server Running on Port ${PORT}`));