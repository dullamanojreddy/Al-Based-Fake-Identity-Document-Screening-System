import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Faculty Mongoose Schema
 * 
 * Stores faculty user credentials for secure authentication.
 * Passwords are hashed using bcryptjs before persistence.
 * 
 * Fields:
 * - email: Unique faculty email (used for login)
 * - passwordHash: bcrypt-hashed password
 * - name: Full name of the faculty member
 * - department: Academic department (optional)
 * - role: Access level (default: 'faculty', special: 'admin')
 * - isActive: Whether account is enabled (default: true)
 * - createdAt: Auto-timestamp on creation
 */
export interface IFaculty extends Document {
  email: string;
  passwordHash: string;
  name: string;
  department?: string;
  role: 'faculty' | 'admin';
  isActive: boolean;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const FacultySchema = new Schema<IFaculty>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: String,
    trim: true,
    default: 'Computer Science',
  },
  role: {
    type: String,
    enum: ['faculty', 'admin'],
    default: 'faculty',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Pre-save hook: Hash password before saving if modified
 */
FacultySchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  } catch (error: any) {
    throw error;
  }
});

/**
 * Compare password method for login validation
 */
FacultySchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Exclude passwordHash from JSON serialization
FacultySchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

export const Faculty = mongoose.model<IFaculty>('Faculty', FacultySchema);