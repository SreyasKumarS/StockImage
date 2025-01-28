import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticate } from '../utils/middlewareAccessToken.js';
import upload from '../config/multer.js';

const userController = new UserController();

const router = Router();
router.post('/register', userController.register);
router.post('/verify-otp', userController.verifyOtp);
router.post('/resend-otp', userController.resendOtp);

router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);


router.post('/uploadImage/:user', upload.array("images"), userController.uploadImages);


router.get("/getImage/:user", userController.getImages);
router.put("/editImage/:id", upload.single("image"), userController.editImage);
router.delete("/deleteImage/:id", userController.deleteImage);
router.put("/replaceImage/:id", upload.single("image"), userController.replaceImage);
router.put("/rotate/:id", userController.rotateImage);
router.put("/reorder", userController.reorderImages);
router.post('/download-images', userController.downloadImages);
router.get("/batches", userController.getSavedBatches);
router.delete('/deletebatches/:batchId', userController.deleteBatch);

export default router;
