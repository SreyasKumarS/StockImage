import User from '../models/userModel.js';
import Image from '../models/imageModel.js'
import fs from 'fs';


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
    const images = await Image.find({ user: userId, saved: false }).sort("order");
    return images;
  }
  
  static async getImageById(id) {
    return await Image.findById(id); 
  }

  static async updateImage(id, updatedData) {
    return await Image.findByIdAndUpdate(id, updatedData, { new: true }); 
  }

  static async updateImageforreplaceimage(id, newImageUrl, newTitle) {
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


  static async getUnsavedImages(userId) {
    try {
      return await Image.find({ user: userId, saved: false }).sort({ order: 1 });
    } catch (error) {
      console.error("Error fetching unsaved images:", error);
      throw error;
    }
  }


  static async assignBatchIdAndSave(images, userId) {
    try {

      const batchId = new Date().toISOString(); 

      const imageIds = images.map((img) => img._id); 
      await Image.updateMany(
        { _id: { $in: imageIds } },
        { $set: { saved: true, batchId: batchId } }
      );

      return batchId;
    } catch (error) {
      console.error("Error updating images with batch ID:", error);
      throw error;
    }
  }

  static async deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  }

  static async getSavedBatches() {
    return await Image.aggregate([
      { $match: { saved: true } }, 
      { $sort: { order: 1 } }, 
      {
        $group: {
          _id: "$batchId", 
          images: { $push: "$$ROOT" }, 
        },
      },
      { $sort: { _id: -1 } }, 
    ]);
  }


  static async deleteBatch(batchId) {
    try {
      return await Image.deleteMany({ batchId });
    } catch (error) {
      console.error("Error in BatchRepository:", error);
      throw error;
    }
  }
 


  
}