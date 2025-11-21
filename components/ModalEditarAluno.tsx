import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Alert } from './ui/Alert'
import { Loader2 } from 'lucide-react'
import type { Aluno } from '../types/aluno'
interface Props {
  aluno: Aluno
  onClose: () => void
  onAlunoEditado: (aluno: Aluno) => void
}
export function ModalEditarAluno({ aluno, onClose, onAlunoEditado }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    nome_aluno: aluno.nome_aluno || '',
    nome_pai: aluno.nome_pai || '',
    email_pai: aluno.email_pai || '',
    valor_mensalidade: aluno.valor_mensalidade?.toString() || '',
    data_vencimento_mensalidade: aluno.data_vencimento_mensalidade || '',
    status_mensalidade: aluno.status_mensalidade
  })
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('alunos')
        .update({
          nome_aluno: form.nome_aluno.trim(),
          nome_pai: form.nome_pai.trim() || null,
          email_pai: form.email_pai.trim(),
          valor_mensalidade: Number(form.valor_mensalidade) || null,
          data_vencimento_mensalidade: form.data_vencimento_mensalidade,
          status_mensalidade: form.status_mensalidade
        })
        .eq('id', aluno.id)
        .select()
        .single()
      if (error) throw error
      if (data) {
        onAlunoEditado(data)
        onClose()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }
  return (
    <Modal isOpen={true} onClose={onClose} title="Editar Aluno">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="error" title="Erro">{error}</Alert>}
        <Input
          label="Nome do Aluno"
          name="nome_aluno"
          value={form.nome_aluno}
          onChange={handleChange}
          required
        />
        <Input
          label="Nome do Responsável"
          name="nome_pai"
          value={form.nome_pai}
          onChange={handleChange}
        />
        <Input
          label="Email do Responsável"
          name="email_pai"
          type="email"
          value={form.email_pai}
          onChange={handleChange}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Mensalidade (R$)"
            name="valor_mensalidade"
            type="number"
            value={form.valor_mensalidade}
            onChange={handleChange}
          />
          <Input
            label="Data de Vencimento"
            name="data_vencimento_mensalidade"
            type="date"
            value={form.data_vencimento_mensalidade}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </span>
            ) : (
              'Salvar'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}