import { getDatabase } from "./client";

export async function getPets() {
    const db = getDatabase();
    const pets = db.collection('pet');
    return await pets.find({}).toArray();
}