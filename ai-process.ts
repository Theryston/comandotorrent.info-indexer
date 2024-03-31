import Anthropic from '@anthropic-ai/sdk'
import sleep from './sleep'
import { changeState, getState } from './state'
import { MAX_AI_ATTEMPTS } from './constants'
import logger from './logger'

type Message = {
    text: string
}

type Params = {
    system: string
    messages: Message[]
    attempts?: number
}

export default async function aiProcess({ system, messages, attempts }: Params) {
    attempts = attempts ? attempts + 1 : 0;

    if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('missing ANTHROPIC_API_KEY in .env')
    }

    if (attempts >= MAX_AI_ATTEMPTS) {
        throw new Error('maximum number of attempts reached')
    }

    const state = await getState();

    if (state.isWaiting) {
        await new Promise(resolve => {
            const interval = setInterval(async () => {
                const newState = await getState();

                if (!newState.isWaiting) {
                    clearInterval(interval);
                    resolve(null);
                }
            }, 1000);
        });
    }

    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY as string
    });

    try {
        const msg = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 4000,
            temperature: 0,
            system,
            messages: [{
                role: 'user',
                content: messages.map(message => ({
                    type: "text",
                    text: message.text
                }))
            }]
        });


        const resultText = msg.content.map((message) => message.text).join('');

        return resultText
    } catch (error: any) {
        if (error.status === 429) {
            const timeToWait = (60 - new Date().getSeconds()) * 1000;

            await changeState({ isWaiting: true });
            logger(`Waiting ${timeToWait / 1000} seconds before retrying...`);
            await sleep(timeToWait);
            logger(`Retrying...`);
            await changeState({ isWaiting: false });

            return aiProcess({ system, messages, attempts });
        } else {
            throw error;
        }
    }
}