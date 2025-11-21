import { Card } from './ui/Card'
interface EscolinhaProfileProps {
  nomeEscolinha: string
  nomeGestor: string
  email: string
}
export function EscolinhaProfile({ nomeEscolinha, nomeGestor, email }: EscolinhaProfileProps) {
  return (
    <Card className="p-4 mb-4">
      <h2 className="text-lg font-semibold mb-4">Perfil da Escolinha</h2>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-500">Nome da Escolinha</label>
          <div className="mt-1 text-sm">{nomeEscolinha}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Gestor</label>
          <div className="mt-1 text-sm">{nomeGestor}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Email</label>
          <div className="mt-1 text-sm text-gray-500">{email}</div>
        </div>
      </div>
    </Card>
  )
}