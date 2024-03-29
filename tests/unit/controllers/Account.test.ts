import { initializeDatabase } from '../../dbHandler';
import { StatusCodes } from "http-status-codes";
import { accountHandler } from "../../../src/server/controllers/Account";
import { User } from "../../../src/server/models/User";
import { Movie } from '../../../src/server/models/Movie';
import httpMocks from "node-mocks-http";

let dbHandler : any;
let next : any;
let res : any;

beforeAll(async () => {
    dbHandler = await initializeDatabase();
    dbHandler.connect();

    res = httpMocks.createResponse();
    next = jest.fn();
});

afterEach(async () => {
    await dbHandler.clearDatabase();
    res = httpMocks.createResponse();
    next = jest.fn();
});

afterAll(async () => await dbHandler.closeDatabase());

const validUser = {
    username: '1234',
    email: 'a@gmail.com',
    password: '123456',
    birthDate: new Date(),
    gender: 'Male',
    genres: ['Action', 'Drama'],
    favorites: [],
}

const validMovie = {
    title: 'Timmy Failure: Mistakes Were Made',
    year: 2020,
    cast: [
      'Winslow Fegley',
      'Ophelia Lovibond',
      'Craig Robinson',
      'Wallace Shawn'
    ],
    genres: [ 'Adventure', 'Comedy', 'Drama', 'Family', 'Fantasy' ],
    extract: 'Timmy Failure: Mistakes Were Made is a 2020 American adventure fantasy comedy-drama family film based on the book series of the same name by Stephan Pastis that debuted on Disney+ on February 7, 2020. The film is directed by Tom McCarthy, produced by Alexander Dostal, McCarthy and Jim Whitaker from a screenplay written by McCarthy and Pastis and stars Winslow Fegley, Ophelia Lovibond, Craig Robinson and Wallace Shawn.',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/en/c/c8/Timmy_Failure_Mistakes_Were_Made_Poster.jpeg',
}

describe("Update methods", () => {
    test("Should update biography", async () => {
        const user = new User(validUser);
        await user.save();

        const req = httpMocks.createRequest({
            body: {
                biography: 'abc123',
            }
        });

        res.locals.user = user;
        await accountHandler.updateBio(req, res);

        expect(res.statusCode).toBe(StatusCodes.NO_CONTENT);

        res = httpMocks.createResponse();
        res.locals.user = user;
        await accountHandler.getPublicAccount(req, res);
        const data = res._getJSONData();

        expect(data.biography).toEqual(req.body.biography);
    });

    test("Should update favorite", async () => {
        const user = new User(validUser);
        await user.save();
        const movie = new Movie(validMovie);
        await movie.save();

        const req = httpMocks.createRequest({
            params: {
                pos: '1',
            }
        });

        res.locals.user = user;
        res.locals.movie = movie;
        await accountHandler.updateFavorite(req, res);

        expect(res.statusCode).toBe(StatusCodes.NO_CONTENT);

        res = httpMocks.createResponse();
        res.locals.user = user;
        await accountHandler.getPublicAccount(req, res);
        let data = res._getJSONData();

        expect(data.favorites[Number(req.params.pos)]).toBe(String(movie._id));

        res = httpMocks.createResponse();
        res.locals.user = user;
        await accountHandler.getPublicAccount(req, res);
        data = res._getJSONData();
    
        expect(data.favorites[0]._id).toEqual(String(movie._id));
    });

    test("Should reject updating favorites on position >= 4", async () => {
        const user = new User(validUser);
        await user.save();
        const movie = new Movie(validMovie);
        await movie.save();

        const req = httpMocks.createRequest({
            params: {
                pos: '4',
            }
        });

        res.locals.user = user;
        res.locals.movie = movie;
        await accountHandler.updateFavorite(req, res);

        expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    test("Should reject updating favorites on position < 0", async () => {
        const user = new User(validUser);
        await user.save();
        const movie = new Movie(validMovie);
        await movie.save();

        const req = httpMocks.createRequest({
            params: {
                pos: '-1',
            }
        });

        res.locals.user = user;
        res.locals.movie = movie;
        await accountHandler.updateFavorite(req, res);

        expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });
}); 