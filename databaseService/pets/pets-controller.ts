import * as petsDao from "./pets-dao.js"
import petsModel from "./pets-model.js";

const PetsController = (app) => {
    app.get('/api/pets', findAllPets);
    app.get('/api/pets/:id', findPetById);
    app.post('/api/pets', createPet);
}

export default PetsController;

const findAllPets = async (req, res) => {
    try {
        const pets = await petsDao.findAllPets();
        res.json(pets);
    } catch (error) {
        console.error('Error fetching towns:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

/*
    Search by petID
*/
const findPetById = async (req, res) => {
    try {
        const id = req.params.id;
        const pet = await petsDao.findPetById(id);
        res.json(pet);
    } catch (error) {
        console.error('Error fetching towns:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



/*
Body Format for createPet
{
  petID: {type: Number, required: true}, 
  playerID: {type: Number, required: true},
  speed: {type: Number, required: true},
  equipped: {type: Boolean, required: true}
}

*/
const createPet = async (req, res) => {
    try {
        const pet = await petsDao.createPet(req.body);
        res.json(pet)
    } catch (error) {
        console.error('Error fetching towns:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const updatePet = async (req, res) => {
    try {
        const petID = req.body.petID;
        const playerID = req.body.playerID;
        const speed = req.body.speed;
        const equipped = req.body.equipped;
        const pet = await petsModel.updateOne({ petID: petID }, 
            { $set: { playerID: playerID, speed: speed, equipped: equipped} });

        res.json(pet);
    } catch (error) {
        console.error('Error fetching towns:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}