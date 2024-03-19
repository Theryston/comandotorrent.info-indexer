import { eq } from "drizzle-orm"
import db from "./db"
import { state } from "./db/schema"

export async function changeState({ isWaiting }: { isWaiting: boolean }) {
    let currentState = await db
        .select()
        .from(state)
        .limit(1)

    if (!currentState[0]) {
        await db
            .insert(state)
            .values({ isWaiting: isWaiting ? 1 : 0 })
    } else {
        await db
            .update(state)
            .set({ isWaiting: isWaiting ? 1 : 0 })
            .where(eq(state.id, currentState[0].id))
    }
}

export async function getState() {
    const currentState = await db
        .select()
        .from(state)
        .limit(1)

    if (!currentState[0]) {
        return { isWaiting: false }
    }

    return currentState[0];
}