import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String, required: false },
  otpExpires: { type: Date, required: false },
});

// Use default export
const User = mongoose.model('User', userSchema);
export default User;
