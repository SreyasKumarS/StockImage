import { UserService } from '../services/userService.js';
import fs from "fs";



export class UserController {
    async register(req, res) {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        try {
            const message = await UserService.registerUser({ name, email, password });
            res.status(201).json({ message });
        } catch (error) {
            console.error('Error registering user');
            res.status(400).json({ message: error.message });
        }
    }

    async verifyOtp(req, res) {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        try {
            const message = await UserService.verifyOtp(email, otp);
            res.status(200).json({ message });
        } catch (error) {
            console.error('Error verifying OTP');
            res.status(400).json({ message: error.message });
        }
    }

    async resendOtp(req, res) {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        try {
            const message = await UserService.resendOtp(email);
            res.status(200).json({ message });
        } catch (error) {
            console.error('Error resending OTP');
            res.status(400).json({ message: error.message });
        }
    }

    async login(req, res){
        
      const { email, password } = req.body;
    
      try {
          const result = await UserService.login(email, password, res);
          return res.status(200).json({
              message: 'Login successful',
              user: result.user,
              token: result.token,
          });
      } catch (error) {
          console.error('erro logging in');
          res.status(400).json({ message: error.message });
      }
    };

    
    async logout(req, res) {
      try {
        await UserService.logout(res); 
        return res.status(200).json({ message: 'Logout successful' }); 
      } catch (error) {
          console.error('erro logging in');
          res.status(400).json({ message: error.message });
      }
    }


    async forgotPassword(req, res) {
      const { email } = req.body;

      if (!email) {
          return res.status(400).json({ message: 'Email is required' });
      }

      try {
          const message = await UserService.sendPasswordResetOtp(email);
          res.status(200).json({ message });
      } catch (error) {
          console.error('Error in forgotPassword:', error.message);
          res.status(400).json({ message: error.message });
      }
  }

  async resetPassword(req, res) {
    const { email, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

      try {
          const message = await UserService.resetPassword(email,newPassword);
          res.status(200).json({ message });
      } catch (error) {
          console.error('Error in resetPassword:', error.message);
          res.status(400).json({ message: error.message });
      }
  }

  //-------------------------------------image------------------------------------------------------//

  async uploadImages(req, res) {
    try {
      const { titles } = req.body; 
      const { user } = req.params; 
      const userId = user;
      const files = req.files; 
      const images = await UserService.uploadImages(userId, files, JSON.parse(titles));
      res.status(201).json({ images }); 
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  
  
  async getImages(req, res) {
    try {
      const { user } = req.params; 
      const userId = user;
    
      const images = await  UserService.getImages(userId);
   
      res.status(200).json({ images });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }



 async editImage(req, res) {
    try {
      const imageId = req.params.id;
      const newTitle = req.body.title;

      const updatedImage = await UserService.editImage(imageId, newTitle);
      res.status(200).json({ image: updatedImage });
    } catch (error) {
      console.error("Error during image update:", error.message);
      res.status(500).json({ message: error.message });
    }
  }




  async deleteImage(req, res) {
    try {
      const id = req.params.id;
      await UserService.deleteImage(id); 
  
      res.status(200).json({ message: "Image deleted successfully!" });
    } catch (error) {
      console.error("Error deleting image:", error.message);
      res.status(500).json({ message: error.message });
    }
  }


  async replaceImage(req, res) {
    try {
      const imageId = req.params.id;
      const file = req.file;
  
      if (!file) {
        return res.status(400).json({ message: "No image file uploaded!" });
      }
  
      const updatedImage = await UserService.replaceImage(imageId, file);
  
      res.status(200).json({ 
        message: "Image replaced successfully!", 
        image: updatedImage 
      });
    } catch (error) {
      console.error("Error replacing image:", error.message);
      res.status(500).json({ message: error.message });
    }
  }
  
  async rotateImage (req, res){
    try {
      const { id } = req.params;
      const { direction } = req.body;
  
      const updatedImage = await UserService.rotateImage(id, direction);
      res.status(200).json({
        message: "Image rotated successfully",
        image: updatedImage,
      });
    } catch (error) {
      console.error("Error rotating image:", error);
      res.status(500).json({ message: "Failed to rotate image" });
    }
  };
  


  async reorderImages(req, res) {
    try {
        
        const { images } = req.body; 
        if (!images || !Array.isArray(images)) {
            return res.status(400).json({ message: "Invalid images array" });
        }

        await UserService.reorderImages(images);
        return res.status(200).json({ message: "Images reordered successfully" });
    } catch (error) {
        console.error("Error in reorderImages:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


  async downloadImages(req, res) {
    try {

  
      const userId = req.body.userId; 

  
      if (!userId) {
        return res.status(400).send("User ID is required.");
      }
 
      const zipFilePath = await UserService.processImagesAndCreateZip(userId);
  
      if (fs.existsSync(zipFilePath)) {
        res.download(zipFilePath, "modified-images.zip", (err) => {
          if (err) {
            console.error("Error during download:", err);
            res.status(500).send("Error during download.");
          } else {
          }
        });
      } else {
        res.status(404).send("File not found.");
      }
    } catch (error) {
      console.error("Error in downloadModifiedImages controller:", error);
      res.status(500).send("An error occurred while processing the request.");
    }
  }
  


  async  getSavedBatches (req, res) {
    try {
      const batches = await UserService.fetchSavedBatches();
      res.status(200).json(batches);
    } catch (error) {
      console.error("Error fetching saved batches:", error);
      res.status(500).send("An error occurred while fetching saved batches.");
    }
  };



  async deleteBatch(req, res) {
    try {
      const { batchId } = req.params; 
      if (!batchId) {
        return res.status(400).json({ error: "Batch ID is required" });
      }

      const result = await UserService.deleteBatch(batchId);

      if (result.deletedCount > 0) {
        return res.status(200).json({ message: "Batch deleted successfully!" });
      } else {
        return res
          .status(404)
          .json({ error: "No batch found with the given Batch ID." });
      }
    } catch (error) {
      console.error("Error deleting batch:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }


}
