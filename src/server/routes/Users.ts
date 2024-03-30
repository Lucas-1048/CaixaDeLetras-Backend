import { Router } from 'express';
import { bodyValidation } from '../middleware/BodyValidation';
import { VerifySignUp } from '../middleware/VerifySignUp';
import { signUp } from '../controllers/SignUp'
import { login } from '../controllers/Login';
import { checkJwtToken } from '../middleware/JWTAuth';
import { accountHandler } from '../controllers/Account';
import { Checks } from '../middleware/Checks';
import { upload } from '../middleware/FileExtension';
import { pictureHandler } from '../controllers/Avatar';

export const router = Router();

router.post('/login', login);

router.post('/signup', [ bodyValidation(VerifySignUp.signUpValidation), 
    VerifySignUp.checkDuplicateEmail, VerifySignUp.checkDuplicateUsername ], signUp);

router.put('/avatar/:idUser', [ checkJwtToken, Checks.checkParamUserId, upload.single('avatar') ],
    pictureHandler.uploadAvatar);

router.delete('/avatar/:idUser', [ checkJwtToken, Checks.checkParamUserId ], pictureHandler.removeAvatar);

router.get('/avatar/:username', [ checkJwtToken, Checks.checkParamUsername ], pictureHandler.getAvatar);

router.get('/profile/:username', [ checkJwtToken, Checks.checkParamUsername ], accountHandler.getPublicAccount);

router.get('/profile/:idUser', [ checkJwtToken, Checks.checkParamUserId ], accountHandler.getPrivateAccount);

router.put('/bio/:idUser', [ checkJwtToken, Checks.checkParamUserId, bodyValidation(Checks.bioValidation) ], 
    accountHandler.updateBio);

router.post('/favorites/:idUser/:idMovie', [ checkJwtToken, Checks.checkParamUserId, Checks.checkParamMovieId ],
    accountHandler.setFavorite);

router.put('/favorites/:idUser/:idMovie', [ checkJwtToken, Checks.checkParamUserId, Checks.checkParamMovieId ], 
    accountHandler.updateFavorite);