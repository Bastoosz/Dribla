import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabaseClient'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req
  const { data: { user }, error: authError } = await supabase.auth.getUser(req.headers.authorization)
  if (authError || !user) {
    return res.status(401).json({ error: 'Não autorizado' })
  }
  switch (method) {
    case 'GET':
      try {
        let { data, error } = await supabase
          .from('escolinhas')
          .select('*')
          .eq('user_id', user.id)
          .single()
        if (error && error.code === 'PGRST116') { 
          const insertData = {
            user_id: user.id,
            nome_escolinha: 'Minha Escolinha',
            nome_gestor: user.user_metadata?.full_name || 'Gestor',
            email: user.email,
            telefone: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          const { data: created, error: insertError } = await supabase
            .from('escolinhas')
            .insert([insertData])
            .select()
            .single()
          if (insertError) throw insertError
          data = created
        } else if (error) {
          throw error
        }
        res.status(200).json(data)
      } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar/criar dados da escolinha' })
      }
      break
    case 'PUT':
      try {
        const updateData = {
          nome_escolinha: req.body.nomeEscolinha,
          nome_gestor: req.body.nomeGestor,
          telefone: req.body.telefone,
          updated_at: new Date().toISOString()
        }
        const { data, error } = await supabase
          .from('escolinhas')
          .update(updateData)
          .eq('user_id', user.id)
          .single()
        if (error) throw error
        res.status(200).json(data)
      } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar dados da escolinha' })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}