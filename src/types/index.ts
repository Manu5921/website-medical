export type Professional = {
  id: string
  email: string
  first_name: string
  last_name: string
  profession: Profession
  rpps_number: string
  phone: string
  address: string
  city: string
  postal_code: string
  latitude?: number
  longitude?: number
  bio?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export type Appointment = {
  id: string
  requester_id: string
  provider_id: string
  patient_first_name: string
  patient_last_name: string
  patient_phone: string
  reason: string
  appointment_date: string
  appointment_time: string
  duration: number
  status: AppointmentStatus
  notes?: string
  created_at: string
  updated_at: string
  requester?: Professional
  provider?: Professional
}

export type Availability = {
  id: string
  professional_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

export type BlockedSlot = {
  id: string
  professional_id: string
  start_datetime: string
  end_datetime: string
  reason: string
}

export type Profession = 
  | 'infirmier'
  | 'kinesitherapeute'
  | 'medecin'
  | 'sage_femme'
  | 'psychologue'
  | 'orthophoniste'
  | 'ergotherapeute'
  | 'podologue'
  | 'dieteticien'
  | 'osteopathe'

export type AppointmentStatus = 
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'

export type UserRole = 'professional'

export type Database = {
  public: {
    Tables: {
      professionals: {
        Row: Professional
        Insert: Omit<Professional, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Professional, 'id' | 'created_at' | 'updated_at'>>
      }
      appointments: {
        Row: Appointment
        Insert: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Appointment, 'id' | 'created_at' | 'updated_at'>>
      }
      availabilities: {
        Row: Availability
        Insert: Omit<Availability, 'id'>
        Update: Partial<Omit<Availability, 'id'>>
      }
      blocked_slots: {
        Row: BlockedSlot
        Insert: Omit<BlockedSlot, 'id'>
        Update: Partial<Omit<BlockedSlot, 'id'>>
      }
    }
  }
}