'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, Loader2, User, FileText, Clock } from 'lucide-react'
import { useAppointments } from '@/hooks/useAppointments'
import { Professional } from '@/types'

const appointmentSchema = z.object({
  patient_first_name: z.string().min(2, 'Prénom du patient requis'),
  patient_last_name: z.string().min(2, 'Nom du patient requis'),
  patient_phone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide'),
  reason: z.string().min(5, 'Motif du rendez-vous requis'),
  appointment_date: z.string().min(1, 'Date requise'),
  appointment_time: z.string().min(1, 'Heure requise'),
  duration: z.string().min(1, 'Durée requise'),
  notes: z.string().max(500, 'Notes trop longues').optional(),
})

type AppointmentFormData = z.infer<typeof appointmentSchema>

interface BookAppointmentDialogProps {
  professional: Professional
  children: React.ReactNode
}

export default function BookAppointmentDialog({ professional, children }: BookAppointmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { createAppointment } = useAppointments()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      duration: '30'
    }
  })

  const duration = watch('duration')

  // Générer les créneaux horaires de 30 minutes de 8h à 19h
  const timeSlots = []
  for (let hour = 8; hour < 19; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`)
  }

  // Durées disponibles
  const durations = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 heure' },
    { value: '90', label: '1h30' },
    { value: '120', label: '2 heures' },
  ]

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      setSubmitting(true)
      setError(null)

      const appointmentData = {
        provider_id: professional.id,
        patient_first_name: data.patient_first_name,
        patient_last_name: data.patient_last_name,
        patient_phone: data.patient_phone,
        reason: data.reason,
        appointment_date: data.appointment_date,
        appointment_time: data.appointment_time,
        duration: parseInt(data.duration),
        notes: data.notes || undefined,
      }

      const result = await createAppointment(appointmentData)

      if (result) {
        setSuccess(true)
        reset()
        setTimeout(() => {
          setOpen(false)
          setSuccess(false)
        }, 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setError(null)
    setSuccess(false)
    reset()
  }

  // Date minimum : aujourd'hui
  const today = new Date().toISOString().split('T')[0]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Prendre rendez-vous
          </DialogTitle>
          <DialogDescription>
            Avec {professional.first_name} {professional.last_name} - {professional.profession}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              Votre demande de rendez-vous a été envoyée avec succès ! 
              Le professionnel va recevoir une notification et pourra confirmer le créneau.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Informations patient */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations patient
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient_first_name">Prénom du patient</Label>
                  <Input
                    id="patient_first_name"
                    {...register('patient_first_name')}
                    placeholder="Jean"
                  />
                  {errors.patient_first_name && (
                    <p className="text-sm text-destructive">{errors.patient_first_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patient_last_name">Nom du patient</Label>
                  <Input
                    id="patient_last_name"
                    {...register('patient_last_name')}
                    placeholder="Dupont"
                  />
                  {errors.patient_last_name && (
                    <p className="text-sm text-destructive">{errors.patient_last_name.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patient_phone">Téléphone du patient</Label>
                <Input
                  id="patient_phone"
                  {...register('patient_phone')}
                  placeholder="06 12 34 56 78"
                />
                {errors.patient_phone && (
                  <p className="text-sm text-destructive">{errors.patient_phone.message}</p>
                )}
              </div>
            </div>

            {/* Créneau */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Créneau souhaité
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointment_date">Date</Label>
                  <Input
                    id="appointment_date"
                    type="date"
                    min={today}
                    {...register('appointment_date')}
                  />
                  {errors.appointment_date && (
                    <p className="text-sm text-destructive">{errors.appointment_date.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appointment_time">Heure</Label>
                  <Select onValueChange={(value) => setValue('appointment_time', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(time => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.appointment_time && (
                    <p className="text-sm text-destructive">{errors.appointment_time.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Durée</Label>
                  <Select 
                    value={duration}
                    onValueChange={(value) => setValue('duration', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {durations.map(dur => (
                        <SelectItem key={dur.value} value={dur.value}>
                          {dur.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.duration && (
                    <p className="text-sm text-destructive">{errors.duration.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Motif et notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Détails de la consultation
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="reason">Motif du rendez-vous</Label>
                <Textarea
                  id="reason"
                  {...register('reason')}
                  placeholder="Ex: Consultation de suivi, rééducation post-opératoire..."
                  rows={3}
                />
                {errors.reason && (
                  <p className="text-sm text-destructive">{errors.reason.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes complémentaires (optionnel)</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Informations supplémentaires, contraintes horaires..."
                  rows={2}
                />
                {errors.notes && (
                  <p className="text-sm text-destructive">{errors.notes.message}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Envoyer la demande
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}