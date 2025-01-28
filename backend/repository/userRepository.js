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


  // static async zipFolderAndSave(sourceFolder, outputFile, userId) {
  //   console.log("Reached zipFolderAndSave in repository");
  
  //   const batchId = new Date().toISOString(); // Generate a unique batch ID for the current batch
  
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       // Step 1: Create the ZIP file
  //       const output = fs.createWriteStream(outputFile);
  //       const archive = archiver('zip', { zlib: { level: 9 } });
  
  //       // Pipe the archive data to the file stream
  //       archive.pipe(output);
  
  //       // Read files in the source folder
  //       const files = fs.readdirSync(sourceFolder, { withFileTypes: true });
  
  //       // Add each file to the archive
  //       files.forEach((file) => {
  //         const filePath = path.join(sourceFolder, file.name);
  //         if (file.isFile()) {
  //           archive.file(filePath, { name: file.name });
  //         }
  //       });
  
  //       // Finalize the archive
  //       archive.finalize();
  
  //       // Step 2: Wait for the archive to finish
  //       output.on('close', async () => {
  //         try {
  //           // Step 3: Update the images for the current batch
  //           await Image.updateMany(
  //             { user: userId, saved: false }, // Identify unsaved images for the user
  //             { $set: { saved: true, batchId: batchId } } // Update `saved` and assign `batchId`
  //           );
  
  //           console.log("Images saved successfully with batchId:", batchId);
  //           resolve(batchId); // Return the batch ID for future reference
  //         } catch (dbError) {
  //           console.error("Error updating images in database:", dbError);
  //           reject(dbError);
  //         }
  //       });
  
  //       archive.on('error', (zipError) => {
  //         console.error("Error creating ZIP file:", zipError);
  //         reject(zipError);
  //       });
  //     } catch (error) {
  //       console.error("Error in zipFolderAndSave:", error);
  //       reject(error);
  //     }
  //   });
  // }
  




  static async getUnsavedImages(userId) {
    try {
      return await Image.find({ user: userId, saved: false }).sort({ order: 1 });
    } catch (error) {
      console.error("Error fetching unsaved images:", error);
      throw error;
    }
  }

  // Assign a batch ID to images and mark them as saved
  static async assignBatchIdAndSave(images, userId) {
    try {

      const batchId = new Date().toISOString(); // Generate a unique batch ID

      const imageIds = images.map((img) => img._id); // Extract image IDs to update

      // Update images in bulk
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

  // Cleanup a file
  static async deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("Deleted file:", filePath);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  }

  static async getSavedBatches() {
    console.log("Reached batch images in repo");
    return await Image.aggregate([
      { $match: { saved: true } }, // Match only saved images
      { $sort: { order: 1 } }, // Sort images by order within the batch
      {
        $group: {
          _id: "$batchId", // Group by batchId
          images: { $push: "$$ROOT" }, // Push the entire image document into the batch
        },
      },
      { $sort: { _id: -1 } }, // Sort batches by batchId (latest batch first)
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