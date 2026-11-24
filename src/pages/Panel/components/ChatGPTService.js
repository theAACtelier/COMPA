import { Configuration, OpenAIApi } from "openai";
import secrets from "secrets";

const MAX_RETRY_LIMIT = 5;

class ChatGPTService {
    constructor() {
        const configuration = new Configuration({
            apiKey: secrets.OPENAI_API_KEY,
        });
        this.openai = new OpenAIApi(configuration);

        // Add cache storage
        this.responseCache = {
            reply: {},
            opinion: {},
            question: {},
            yesno: {}
        };

        // Store the example prompts for each intention type
        this.examplePrompts = {
            reply: {
                userExample: "Person A said: \"I heard you went to Disney this spring break, how was it?\"\nPerson B said: \"It's the happiest place in the world in my view haha, what do you think?\"\n\nGiven the above conversation exchanged between Person A and Person B, suggest 3 possible starter phrases for replies that Person C can use to initiate a response regarding what was discussed in the conversation. The output should and only be in a single JSON object. The starter phrases should be limited to 6 words. In addition, the starter phrases must end with \"...\".",
                assistantExample: "[\n\"Speaking of Disney…\",\n\"I'm glad you like it…\",\n\"Well that is a hard question…\"\n]"
            },
            opinion: {
                userExample: "Person A said: \"I heard you went to Disney this spring break, how was it?\"\nPerson B said: \"It's the happiest place in the world in my view haha, what do you think?\"\n\nGiven the above conversation exchanged between Person A and Person B, suggest 3 possible starter phrases of opinions that Person C can use to initiate a response regarding what was discussed in the conversation. The starter phrases should be limited to 6 words. In addition, the starter phrases must end with \"...\". The output should and only be in a single JSON object.",
                assistantExample: "[\n\"I honestly have to say...\",\n\"From my perspective...\",\n\"Hmm not sure if I agree...\"\n]"
            },
            question: {
                userExample: "Person A said: \"I heard you went to Disney this spring break, how was it?\"\nPerson B said: \"It's the happiest place in the world in my view haha, what do you think?\"\n\nGiven the above conversation exchanged between Person A and Person B, suggest 3 possible starter phrases of questions that Person C can ask to initiate a response regarding what was discussed in the conversation. The starter phrases should be limited to 6 words. In addition, the starter phrases must end with \"...\". The output should and only be in a single JSON object.",
                assistantExample: "[\n\"Why did you…\",\n\"How did you come up with…\",\n\"Where did you…\"\n]"
            },
            yesno: {
                userExample: "Person A said: \"I heard you went to Disney this spring break, how was it?\"\nPerson B said: \"It's the happiest place in the world in my view haha, what do you think?\"\n\nGiven the above conversation exchanged between Person A and Person B, suggest 3 possible starter phrases that start with yes or no that Person C can use to initiate a response regarding what was discussed in the conversation. The starter phrases should be limited to 6 words. In addition, the starter phrases must end with \"...\". The output should and only be in a single JSON object.",
                assistantExample: "[\n\"Yes, I totally agree…\",\n\"Yes, I almost…\",\n\"No, I don't really like…\"\n]"
            }
        };
    }

    async getResponseForCondition2(prompt1, prompt2) {
        console.log("calling chatbotApp C2 with prompt1", prompt1, "and prompt2", prompt2);

        if (!prompt2) {
            console.log("No prompt2 provided");
            return [];
        }

        try {
            const result = await this.openai.createChatCompletion({
                "model": "gpt-3.5-turbo",
                "messages": [
                    { "role": "system", "content": "You are a helpful assistant that gives three starter phrases to suggest possible responses but not complete sentences, the response should be limited to 6 words" },
                    { "role": "user", "content": "Person A said 'I just finished my work', Person B said 'Do you wanna get coffee', give a response to person B's message as Person A" },
                    { "role": "assistant", "content": "Three possible generic starter phrases would be:\n 1. Yes, I was just...\n 2. Sure! I would love ...\n 3. Where do you wanna ...\n" },
                    { "role": "user", "content": "Person A said 'Did you watch the new Avatar movie?', Person B said 'Yes, it was so long but so interesting', give a response to person B's message as Person A" },
                    { "role": "assistant", "content": " Three possible generic starter phrases would be:\n 1. Exactly! I almost...\n 2. It's absolutely… 3. Are you a fan of...\n" },
                    { "role": "user", "content": "Person A said" + prompt2 + "combining the context, give a response to person A's message as Person B" }
                ],
            });

            return this.parseCondition2Response(result);
        } catch (error) {
            console.error('ChatGPT API error:', error);
            throw error;
        }
    }

    parseCondition2Response(result) {
        const message = result.data.choices[0].message.content;
        console.log("from model- " + message);

        let s0 = "", s1 = "", s2 = "", s3 = "";
        let newstring = "";

        for (let i = 0; i < message.length; i++) {
            newstring = newstring + message[i];
            if (message[i] === "\n") {
                if (s0 === "") {
                    s0 = newstring;
                    s0 = s0.replace(/^\s*\d+\.\s*/, '').trim();
                    newstring = "";
                } else if (s1 === "") {
                    s1 = newstring;
                    s1 = s1.replace(/^\s*\d+\.\s*/, '').trim();
                    newstring = "";
                } else if (s2 === "") {
                    s2 = newstring;
                    s2 = s2.replace(/^\s*\d+\.\s*/, '').trim();
                    newstring = "";
                    s3 = message.slice(i + 1, message.length);
                    s3 = s3.replace(/^\s*\d+\.\s*/, '').trim();
                }
            }
        }

        if (s0 === "" && s1 === "" && s2 === "" && s3 === "") {
            console.log("message empty and it is: " + message);
            return [];
        }

        console.log(s0 + "\n" + s1 + "\n" + s2 + "\n" + s3);
        return [s1, s2, s3];
    }

    validateAndParse(response, defaultValue) {
        try {
            const content = response?.data?.choices?.[0]?.message?.content;
            if (!content) {
                console.log('No content in response, using default');
                return defaultValue;
            }

            const parsed = JSON.parse(content);

            // Handle any object format
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                const phrases = Object.values(parsed)
                    .filter(phrase => typeof phrase === 'string' && phrase.trim() !== '')
                    .slice(0, 3);  // Take only first 3 phrases

                return phrases.length > 0 ? phrases : defaultValue;
            }

            // Handle array format
            if (Array.isArray(parsed)) {
                return parsed.filter(phrase =>
                    typeof phrase === 'string' && phrase.trim() !== ''
                ).slice(0, 3);
            }

            console.log('Unexpected response format, using default:', parsed);
            return defaultValue;
        } catch (error) {
            console.error('Error parsing response:', error);
            return defaultValue;
        }
    }

    async getResponseForIntention(prompt1, prompt2, intentionType) {
        const dialogKey = `${prompt1}|${prompt2}`;

        // Check cache first
        if (this.responseCache[intentionType][dialogKey]) {
            console.log('Returning cached response for', intentionType);
            return this.responseCache[intentionType][dialogKey];
        }

        let result;
        let retryCount = 1;

        while (!result && retryCount <= MAX_RETRY_LIMIT) {
            console.log(`ATTEMPTING TO CALL CHATGPT | ${intentionType} |`, retryCount);
            try {
                result = await this.openai.createChatCompletion({
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        { "role": "system", "content": "You are a helpful assistant that follows the instructions to the letter." },
                        { "role": "user", "content": this.examplePrompts[intentionType].userExample },
                        { "role": "assistant", "content": this.examplePrompts[intentionType].assistantExample },
                        { "role": "user", "content": `Person A said: "${prompt1}"\nPerson B said: "${prompt2}"\n\nGiven the above conversation exchanged between Person A and Person B, suggest 3 possible starter phrases ${this.getIntentionPrompt(intentionType)} that Person C can use to initiate a response regarding what was discussed in the conversation. The output should and only be in a single JSON object composed of 3 fields, each field containing a starter phrase. The starter phrases should be limited to 6 words. In addition, the starter phrases must end with "...".` }
                    ],
                });
            } catch (err) {
                console.error(`Attempt ${retryCount} failed:`, err);
            }
            retryCount++;
        }

        if (!result?.data?.choices?.[0]?.message?.content) {
            return this.getDefaultResponse(intentionType);
        }

        const responses = this.validateAndParse(result, []);

        // Cache the result
        this.responseCache[intentionType][dialogKey] = responses;

        return responses;
    }

    getDefaultResponse(intentionType) {
        const defaults = {
            reply: ["That makes sense...", "I see what you mean...", "I'm not sure, but..."],
            opinion: ["I honestly have to say...", "From my perspective...", "Hmm not sure if I agree..."],
            question: ["Do you think that...", "Is it possible that...", "Would you say that..."],
            yesno: ["Yes, I think that...", "No, I would say...", "Yes, it seems like..."]
        };
        return {
            data: {
                choices: [{
                    message: {
                        content: JSON.stringify(defaults[intentionType])
                    }
                }]
            }
        };
    }

    getIntentionPrompt(intentionType) {
        switch (intentionType) {
            case 'reply':
                return 'for replies';
            case 'opinion':
                return 'of opinions';
            case 'question':
                return 'of questions';
            case 'yesno':
                return 'that start with yes or no';
            default:
                return 'for replies';
        }
    }
}

export const chatGPTService = new ChatGPTService(); 