import bcrypt from 'bcrypt';
import { UserRepository } from '../repository/userRepository.js';
import { sendEmail } from '../utils/sentEmail.js';
import {generateAccessToken,generateRefreshToken } from '../utils/userTokenGenerator.js'
import fs from "fs";
import path from "path";
import sharp from 'sharp';
import archiver from 'archiver';



export class UserService {
  static async registerUser({ name, email, password }) {
      try {
          const existingUser = await UserRepository.findByEmail(email);
          if (existingUser) {
              throw new Error('User with this email already exists');
          }

          const hashedPassword = await bcrypt.hash(password, 10);
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const otpExpires = Date.now() + 10 * 60 * 1000; 

          const newUser = {
              name,
              email,
              password: hashedPassword,
              otp,
              otpExpires,
          };

          await UserRepository.save(newUser);
          await sendEmail(email, 'Verify Your Account', `Your OTP is ${otp}`);

          return 'User registered successfully. OTP sent to your email.';
      } catch (error) {
          console.error('Error in UserService:', error.message);
          throw new Error(error.message || 'Failed to register user');
      }
  }

  static async verifyOtp(email, otp) {
      try {
          const user = await UserRepository.findByEmail(email);

          if (!user) {
              throw new Error('User not found');
          }

          if (user.otpExpires < Date.now()) {
              throw new Error('OTP has expired');
          }

          if (otp !== user.otp) {
              throw new Error('Invalid OTP');
          }

          user.otp = null; 
          user.otpExpires = null; 
          await UserRepository.update(user);

          return 'OTP verified successfully. Registration complete.';
      } catch (error) {
          console.error('Error in verifyOtp:', error.message);
          throw new Error(error.message || 'OTP verification failed');
      }
  }

  static async resendOtp(email) {
      try {
          const user = await UserRepository.findByEmail(email);

          if (!user) {
              throw new Error('User not found');
          }

          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const otpExpires = Date.now() + 10 * 60 * 1000;

          user.otp = otp;
          user.otpExpires = otpExpires;
          await UserRepository.update(user);
          await sendEmail(email, 'Resend OTP', `Your new OTP is ${otp}`);

          return 'OTP resent successfully.';
      } catch (error) {
          console.error('Error in resendOtp:', error.message);
          throw new Error(error.message || 'Failed to resend OTP');
      }
  }

  static async login(email, password, res) { 

      try {
         
          const user = await UserRepository.findByEmail(email);
          if (!user) {
              throw new Error('Invalid email or password');
          }
  
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
              throw new Error('Invalid email or password');
          }
  
          const accessToken = generateAccessToken(user);
          generateRefreshToken(user, res);
  
          return {
                user: {
                  id: user._id.toString(),
                  name: user.name,
                  email: user.email,
              },
              token: accessToken,
          };
      } catch (err) {
          console.error("Error during login:", err);
          throw new Error("Login failed. Please try again.");
      }
  }    

  static async logout(res) { 
      try {
        res.cookie('refreshToken', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          expires: new Date(0), 
        });
      } catch (error) {
        throw new Error('Failed to log out: ' + error.message);
      }
    };

    static async sendPasswordResetOtp(email) {
      try {
          const user = await UserRepository.findByEmail(email);

          if (!user) {
              throw new Error('User not found');
          }

          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const otpExpires = Date.now() + 10 * 60 * 1000; 

          user.otp = otp;
          user.otpExpires = otpExpires;

          await UserRepository.update(user);
          await sendEmail(email, 'Password Reset OTP', `Your OTP is ${otp}`);

          return 'OTP sent to your email for password reset.';
      } catch (error) {
          console.error('Error in sendPasswordResetOtp:', error.message);
          throw new Error(error.message || 'Failed to send password reset OTP');
      }
  }

  static async resetPassword(email,newPassword) {
      try {
          const user = await UserRepository.findByEmail(email);

          if (!user ) {
              throw new Error('User not found');
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            user.password = hashedPassword; 
            await user.save();
          
      } catch (error) {
          console.error('Error in resetPassword:', error.message);
          throw new Error(error.message || 'Failed to reset password');
      }
  }


//-------------------------------------images-----------------------------------------------//


    static async uploadImages(userId, files, titles) {
        const images = files.map((file, index) => ({
          user: userId, 
          title: titles[index] || "", 
          url: `/uploads/${file.filename}`, 
          order: index,
        }));
      
        return await Promise.all(images.map(UserRepository.createImage));
      }


  static async getImages(userId) {
    return await UserRepository.getImagesByUser(userId);
  }



static async editImage(imageId, newTitle) {
    const oldImage = await UserRepository.getImageById(imageId);
    if (!oldImage) {
      throw new Error("Image not found!");
    }

    const oldImagePath = path.join(process.cwd(), "public", oldImage.url); 

    const sanitizedTitle = newTitle
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, ""); 

    const fileExtension = path.extname(oldImage.url);
    const newFileName = `${sanitizedTitle}${fileExtension}`;
    const newImagePath = path.join(process.cwd(), "public", "uploads", newFileName);


    if (fs.existsSync(oldImagePath)) {
      fs.renameSync(oldImagePath, newImagePath);
    } else {
      throw new Error("File not found on server");
    }

    const updatedData = {
      title: newTitle,
      url: `/uploads/${newFileName}`,
    };

    return await UserRepository.updateImage(imageId, updatedData);
  }

  
static async deleteImage(id) {
    
    const image = await UserRepository.getImageById(id);
    if (!image) {
      throw new Error("Image not found!");
    }
    const filePath = path.join(process.cwd(), "public", image.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    } else {
      console.warn("File not found on server:", filePath);
    }
    await UserRepository.deleteImage(id);
  }



  static async replaceImage(id, file) {
    try {
      const oldImage = await UserRepository.getImageById(id);
      if (!oldImage) {
        throw new Error("Image not found!");
      }
  
      const oldFilePath = path.join(process.cwd(), "public", oldImage.url);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
  
      const newImageUrl = `/uploads/${Date.now()}-${file.originalname}`;
      const newTitle = file.originalname.split(".")[0]; 
  
      const updatedImage = await UserRepository.updateImageforreplaceimage(id, newImageUrl, newTitle);
  
      const newFilePath = path.join(process.cwd(), "public", newImageUrl);
      fs.renameSync(file.path, newFilePath);
  
      return updatedImage;
    } catch (error) {
      console.error("Error in replaceImage service:", error.message);
      throw error;
    }
  }
  
  
  static async rotateImage(id, direction) {
    const image = await UserRepository.getImageById(id);
    if (!image) throw new Error("Image not found");
  
    const rotationAngle = direction === "left" ? -90 : 90;
  
    try {
      const updatedImage = await UserRepository.updateRotation(id, rotationAngle);
  
      return updatedImage; 
    } catch (error) {
      throw new Error("Error updating image rotation in database: " + error.message);
    }
  }
  

  static async reorderImages(images) {
    const uploadsFolder = path.join(process.cwd(), "public", "uploads");
    
    const updatePromises = images.map((image, index) =>
        UserRepository.updateImageOrder(image._id, index)
    );
    await Promise.all(updatePromises);
    for (let i = 0; i < images.length; i++) {
        const image = images[i];
   
        const filePath = path.join(uploadsFolder, image.url);
        
        if (fs.existsSync(filePath)) {
            const newTime = new Date().getTime() + i; 
            fs.utimesSync(filePath, new Date(newTime), new Date(newTime)); 
        } else {
            console.error(error);
        }
    }
}


  static async processImagesAndCreateZip(userId) {
    try {
      const unsavedImages = await UserRepository.getUnsavedImages(userId);
      if (unsavedImages.length === 0) {
        throw new Error("No unsaved images found for the user.");
      }

      const tempFolder = path.join(process.cwd(), "temp");
      if (!fs.existsSync(tempFolder)) fs.mkdirSync(tempFolder);

      const processedImages = [];
      for (let image of unsavedImages) {
        const originalImagePath = path.join(process.cwd(), "public", "uploads", image.url.split("/").pop());
        const modifiedImagePath = path.join(tempFolder, path.basename(image.url));

        if (fs.existsSync(originalImagePath)) {
          await sharp(originalImagePath)
            .rotate(image.rotation || 0)
            .toFile(modifiedImagePath);

          processedImages.push({ path: modifiedImagePath, order: image.order });
        }
      }

      processedImages.sort((a, b) => a.order - b.order);

      const zipFilePath = path.join(process.cwd(), "public", "modified-images.zip");
      const imagePaths = processedImages.map((img) => img.path);

      await UserService.createZip(imagePaths, zipFilePath);
      const batchId = await UserRepository.assignBatchIdAndSave(unsavedImages, userId);
      return zipFilePath;
    } catch (error) {
      console.error("Error in processImagesAndCreateZip:", error);
      throw error;
    }
  }

  static async createZip(imagePaths, outputFile) {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputFile);
      const archive = archiver("zip", { zlib: { level: 9 } });

      archive.pipe(output);
      imagePaths.forEach((imagePath) => {
        archive.file(imagePath, { name: path.basename(imagePath) });
      });

      archive.finalize();
      output.on("close", resolve);
      archive.on("error", reject);
    });
  }


  static async fetchSavedBatches (){
    return await UserRepository.getSavedBatches();
  };


  static async deleteBatch(batchId) {
    try {
      return await UserRepository.deleteBatch(batchId);
    } catch (error) {
      console.error("Error in BatchService:", error);
      throw error;
    }
  }



}
