// Exposes functions that are used to interact with the DB directly

import clubModel, { IClubModel } from '../models/club.model';

/**
 * fetchAllClubs mate
 * 
 * Returns all the clubs in the game
 * @returns - {error: boolean, result: any | IClubModel}
 */
export const fetchAllClubs = async ()=>{
    try {
        const clubs = await clubModel.find({});
        return ({ error: false, result: clubs });
    }
    catch (err) {
        return ({ error: true, result: err });
    }
};

/**
 * fecthSingleClubById
 * 
 * get a single club by its id brooooo
 * 
 * @param id Club id
 */
export const fetchSingleClubById = async (id: any)=>{
    try {
        const club = await clubModel.findById(id);
        return ({error: false, result: club});
    }
    catch(err){
        return ({error: true, result: err});
    }
};


/**
 * createNewClub mate
 * 
 * @param c Club making data
 * @returns - {error: boolean, result: any | IClubModel}
 */
export const createNewClub = (c: any) => {
    const CLUB: IClubModel = new clubModel(c);

    return CLUB.save()
    .then((club: IClubModel) => ({error: false, result: club}))
    .catch((error => ({error: true, result: error})))
};