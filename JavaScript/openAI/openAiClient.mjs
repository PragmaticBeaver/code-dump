import {Configuration, OpenAIApi} from "openai";


const configuration = new Configuration({
    organization: "org-yCU6LBtfwg0twGb9E6UCk2l7", // default value if no organization is set
    apiKey: process.env.OPENAI_API_KEY,
});
const _openai = new OpenAIApi(configuration);
const MODEL = "gpt-3.5-turbo"; // free option
// const ANSWERS_COUNT = 10; // number of answers expected from openAI

const FINISH_REASONS = {
    STOP: "stop", // finished OR stop sequences provided via the stop parameter
    LENGTH: "length", // incomplete => max_tokens parameter or token limit
    FUNCTION_CALL: "function_call", // model called a function
    CONTENT_FILTER: "content_filter", // omitted due to content filter (NSFW, profanity, etc.)
    NULL: "null", // in progress
}

function createMessage(text) {
    return [{role: "user", content: text}];
}

function createMessages(texts) {
    return texts.map((text) => { return {role: "user", content: text} });
}

function mapQuestionsToChoices(questions, choices) {
 return questions.map((question, index) => {
    const choice = choices[index];
    return { question, answer: choice?.message?.content }
 });
}

export async function askQuestion(question) {
    let response = undefined;
    try {
        const completion = await _openai.createChatCompletion({
            model: MODEL,
            messages: [{"role": "system", "content": "Du bist ein Assistent der nur JSON spricht, antworte niemals in normalem Text."}, ...createMessage(question)],
        });
        response = completion.data.choices[0]; // will always contain one answer
    } catch (e) {
        console.error(e);
    }
    return response;
}

export async function askQuestions(questions) {
    let response = undefined;
    try {
        const completion = await _openai.createChatCompletion({
            model: MODEL,
            messages: [{"role": "system", "content": "Du bist ein Assistent der nur JSON spricht, antworte niemals in normalem Text."}, ...createMessage(questions)],
        });
        response = completion.data.choices; // may contain multiple answers
    } catch (e) {
        console.error(e);
    }
    return response;
}