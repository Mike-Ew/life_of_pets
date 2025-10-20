import { Request } from 'express';

// User types
export interface User {
  id: number;
  email: string;
  password_hash: string;
  name?: string;
  location?: string;
  profile_picture_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreateInput {
  email: string;
  password: string;
  name?: string;
  location?: string;
}

// Pet types
export interface Pet {
  id: number;
  user_id: number;
  name: string;
  age?: number;
  breed?: string;
  description?: string;
  looking_for?: string;
  temperament_tags?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface PetCreateInput {
  name: string;
  age?: number;
  breed?: string;
  description?: string;
  looking_for?: string;
  temperament_tags?: string[];
}

// Pet Photo types
export interface PetPhoto {
  id: number;
  pet_id: number;
  url: string;
  is_main: boolean;
  created_at: Date;
}

// Care Template types
export interface CareTemplate {
  id: number;
  pet_id: number;
  type: CareType;
  title: string;
  cadence?: string;
  time_of_day?: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Care Event types
export interface CareEvent {
  id: number;
  pet_id: number;
  template_id?: number;
  title: string;
  due_at: Date;
  status: 'upcoming' | 'done' | 'skipped' | 'overdue';
  created_at: Date;
  updated_at: Date;
}

// Care Log types
export interface CareLog {
  id: number;
  pet_id: number;
  type: CareLogType;
  title?: string;
  value?: string;
  occurred_at: Date;
  notes?: string;
  created_at: Date;
}

export interface CareLogCreateInput {
  type: CareLogType;
  title?: string;
  value?: string;
  occurred_at?: Date;
  notes?: string;
}

// Enums
export type CareType = 'vaccination' | 'bath' | 'feeding' | 'medication' | 'grooming' | 'deworming' | 'flea_tick' | 'exercise';
export type CareLogType = CareType | 'weight' | 'note';

// Auth types
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export interface JWTPayload {
  id: number;
  email: string;
}
