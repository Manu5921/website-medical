import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Profession } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
  }).format(new Date(date))
}

export function formatTime(time: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    timeStyle: 'short',
  }).format(new Date(`2000-01-01T${time}`))
}

export function getProfessionLabel(profession: Profession): string {
  const labels: Record<Profession, string> = {
    infirmier: 'Infirmier(ère)',
    kinesitherapeute: 'Kinésithérapeute',
    medecin: 'Médecin',
    sage_femme: 'Sage-femme',
    psychologue: 'Psychologue',
    orthophoniste: 'Orthophoniste',
    ergotherapeute: 'Ergothérapeute',
    podologue: 'Podologue',
    dieteticien: 'Diététicien(ne)',
    osteopathe: 'Ostéopathe',
  }
  return labels[profession]
}

export function getAppointmentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmé',
    cancelled: 'Annulé',
    completed: 'Terminé',
  }
  return labels[status] || status
}

export function validateRPPS(rpps: string): boolean {
  // RPPS validation: 11 digits
  const rppsRegex = /^\d{11}$/
  return rppsRegex.test(rpps)
}

export function formatPhoneNumber(phone: string): string {
  // Format French phone number
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
  }
  return phone
}
