import petsModel from "./pets-model.js";

export const findAllPets = () =>
    petsModel.find();

export const findPetById = (id) =>
    petsModel.find({petId: id});

export const createPet = (pet) =>
    petsModel.create(pet)