import User from '../models/userModel.js';
import Image from '../models/imageModel.js'
import fs from 'fs';
import archiver from 'archiver';
import path from "path";


export class UserRepository {
  static async findByEmail(email) {
      try {
          return await User.findOne({ email });
      } catch (error) {
          console.error('Error finding user by email:', error.message);
          throw new Error('Database query failed');
      }
  }

  static async save(user) {
      try {
          const newUser = new User(user);
          return await newUser.save();
      } catch (error) {
          console.error('Error saving user:', error.message);
          throw new Error('Failed to save user to database');
      }
  }

 static async update(user) {
      try {
          return await User.findByIdAndUpdate(user._id, user, { new: true });
      } catch (error) {
          console.error('Error updating user:', error.message);
          throw new Error('Failed to update user');
      }
  }

  //-------------------------------------images---------------------------------------------------//


  static async createImage(imageData) {
    return await Image.create(imageData);
  }

  
  static async getImagesByUser(userId) {
    const images = await Image.find({ user: userId }).sort("order");
    return images
  }


  static async getImageById(id) {
    return await Image.findById(id); 
  }

  static async updateImage(id, updatedData) {
    return await Image.findByIdAndUpdate(id, updatedData, { new: true }); 
  }

  static async updateImageforreplaceimage(id, newImageUrl, newTitle) {
    console.log("Updating image for ID:", id, "with new URL:", newImageUrl, "and new title:", newTitle); 
    return await Image.findByIdAndUpdate(
      id,
      { url: newImageUrl, title: newTitle },
      { new: true }
    );
  }
  
  
  
  static async deleteImage(id) {
    return await Image.findByIdAndDelete(id);
  }



static async updateRotation (id, angle){
    const image = await Image.findById(id);
    if (!image) throw new Error("Image not found");
  
    const newRotation = (image.rotation || 0) + angle; 
    image.rotation = newRotation;
    await image.save();
  
    return image;
  };





  static async updateImageOrder(imageId, newOrder) {
    return await Image.findByIdAndUpdate(
      imageId,
      { order: newOrder },
      { new: true }
    );
  }




  static async zipFolder(sourceFolder, outputFile) {
    console.log('Reached zipFolder in repository');
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputFile);
      const archive = archiver('zip', { zlib: { level: 9 } });
  
      // Pipe the archive data to the file stream
      archive.pipe(output);
  
      // Read files in the source folder as-is (without sorting)
      const files = fs.readdirSync(sourceFolder, { withFileTypes: true });
  
      // Add each file to the archive in the exact filesystem order
      files.forEach((file) => {
        const filePath = path.join(sourceFolder, file.name);
        if (file.isFile()) {
          archive.file(filePath, { name: file.name });
        }
      });
  
      // Finalize the archive
      archive.finalize();
  
      output.on('close', resolve);
      archive.on('error', reject);
    });
  }
  



  
  static async deleteFile(filePath){
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  };





}