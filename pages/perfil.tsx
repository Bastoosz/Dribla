import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'
import { supabase } from '../lib/supabaseClient'
export default function Perfil() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [perfil, setPerfil] = useState({
    nomeEscolinha: '',
    nomeGestor: '',
    email: '',
    telefone: ''
  })
  const [editForm, setEditForm] = useState({ ...perfil })
  const handleEdit = () => {
    setIsEditing(true)
    setEditForm({ ...perfil })
    setError('')
    setSuccess('')
  }
  const handleCancel = () => {
    setIsEditing(false)
    setEditForm({ ...perfil })
    setError('')
    setSuccess('')
  }
  useEffect(() => {
    loadPerfilData()
  }, [])
  const loadPerfilData = async () => {
    try {
      setIsLoading(true)
      setError('')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Usuário não autenticado')
        return
      }
      let { data: escolinha, error: fetchError } = await supabase
        .from('treinadores')
        .select('nome_escolinha, nome_gestor, telefone')
        .eq('id', user.id)
        .single()
      if (fetchError) {
        console.error('Erro ao buscar dados:', fetchError)
        setError('Erro ao carregar dados do perfil')
        return
      }
      const perfilData = {
        nomeEscolinha: escolinha?.nome_escolinha || '',
        nomeGestor: escolinha?.nome_gestor || '',
        email: user.email || '',
        telefone: escolinha?.telefone || ''
      }
      setPerfil(perfilData)
      setEditForm(perfilData)
    } catch (err: any) {
      console.error('Erro ao carregar perfil:', err)
      setError('Erro ao carregar dados do perfil')
    } finally {
      setIsLoading(false)
    }
  }
  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError('')
      setSuccess('')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Usuário não autenticado')
        return
      }
      const { error: updateError } = await supabase
        .from('treinadores')
        .update({
          nome_escolinha: editForm.nomeEscolinha,
          nome_gestor: editForm.nomeGestor,
          telefone: editForm.telefone
        })
        .eq('id', user.id)
      if (updateError) {
        console.error('Erro ao atualizar:', updateError)
        setError('Erro ao salvar alterações')
        return
      }
      setPerfil({
        ...perfil,
        nomeEscolinha: editForm.nomeEscolinha,
        nomeGestor: editForm.nomeGestor,
        telefone: editForm.telefone
      })
      setSuccess('Dados atualizados com sucesso!')
      setIsEditing(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      console.error('Erro ao salvar perfil:', err)
      setError('Erro ao salvar alterações')
    } finally {
      setIsSaving(false)
    }
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    })
  }
  return (
    <Layout title="Perfil da Escolinha">
      <div className="max-w-3xl mx-auto px-2">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Perfil da Escolinha</h1>
          <p className="text-sm md:text-base text-gray-400">Gerencie as informações da sua escolinha</p>
        </div>
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-2xl p-4 md:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-bold text-white">Informações</h2>
            {!isEditing ? (
              <Button onClick={handleEdit} disabled={isLoading} className="shadow-lg shadow-dribla-green/20 w-full sm:w-auto">Editar Perfil</Button>
            ) : (
              <div className="flex gap-3 w-full sm:w-auto">
                <Button variant="outline" onClick={handleCancel} disabled={isSaving} className="border-gray-600 hover:border-gray-500 flex-1 sm:flex-initial">Cancelar</Button>
                <Button onClick={handleSave} disabled={isSaving} className="shadow-lg shadow-dribla-green/20 flex-1 sm:flex-initial">
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            )}
          </div>
          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" className="mb-6">
              {success}
            </Alert>
          )}
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Carregando...</div>
          ) : (
          <div className="space-y-6">
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Nome da Escolinha
              </label>
              {isEditing ? (
                <Input
                  name="nomeEscolinha"
                  value={editForm.nomeEscolinha}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border-gray-600"
                />
              ) : (
                <p className="text-lg text-white font-medium">{perfil.nomeEscolinha}</p>
              )}
            </div>
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Nome do Gestor
              </label>
              {isEditing ? (
                <Input
                  name="nomeGestor"
                  value={editForm.nomeGestor}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border-gray-600"
                />
              ) : (
                <p className="text-lg text-white font-medium">{perfil.nomeGestor}</p>
              )}
            </div>
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email
              </label>
              <p className="text-lg text-white font-medium">{perfil.email}</p>
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                Email não pode ser alterado
              </p>
            </div>
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Telefone
              </label>
              {isEditing ? (
                <Input
                  name="telefone"
                  value={editForm.telefone}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border-gray-600"
                />
              ) : (
                <p className="text-lg text-white font-medium">{perfil.telefone || 'Não informado'}</p>
              )}
            </div>
          </div>
          )}
        </Card>
      </div>
    </Layout>
  )
}