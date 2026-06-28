import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  college: z.string().min(1, 'College / Institution is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  college: z.string().min(1, 'College / Institution is required'),
  bio: z.string().min(5, 'Bio must be at least 5 characters'),
  location: z.string().optional(),
  contactUrl: z.string().optional(),
  teachSkills: z.array(z.string()).min(1, 'Select at least one skill to teach'),
  learnSkills: z.array(z.string()).min(1, 'Select at least one skill to learn'),
  avatar: z.string().url('Invalid image URL').or(z.string().length(0)),
});

export const teamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  description: z.string().min(5, 'Mission description must be at least 5 characters'),
  category: z.string().min(1, 'Category is required'),
  skillsRequired: z.string().min(1, 'Enter at least one skill (comma separated)'),
  maxMembers: z.number().min(2).max(20),
});

export const postSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  skills: z.string().min(1, 'Enter at least one skill (comma separated)'),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(3, 'Comment must be at least 3 characters'),
});
