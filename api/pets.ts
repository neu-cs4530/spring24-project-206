import { getDatabase } from "./client";

export async function pets() {
    const db = await getDatabase();
    const pets = db.collection('pet');
    const res = await pets.find({}).toArray();
    console.log("result in getPets:", res);
    return res;
}