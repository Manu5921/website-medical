import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

export function SupabaseSetupNotice() {
  return (
    <Alert className="max-w-2xl mx-auto mt-8">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Configuration Supabase requise</AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p>Pour utiliser cette fonctionnalité, vous devez :</p>
        <ol className="list-decimal list-inside space-y-1 ml-4">
          <li>Créer un fichier <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> à la racine du projet</li>
          <li>Ajouter vos clés Supabase (voir <code className="bg-muted px-1 py-0.5 rounded">.env.local.example</code>)</li>
          <li>Exécuter le script SQL dans votre projet Supabase</li>
          <li>Redémarrer le serveur de développement</li>
        </ol>
      </AlertDescription>
    </Alert>
  )
}