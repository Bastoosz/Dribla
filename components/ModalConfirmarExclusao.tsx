// components/ModalConfirmarExclusao.tsx

import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { Aluno } from '../types/aluno.ts';

interface ModalConfirmarExclusaoProps {
  aluno: Aluno | null;
  onClose: () => void;
  onAlunoExcluido: () => void;
}

const ModalConfirmarExclusao: React.FC<ModalConfirmarExclusaoProps> = ({ aluno, onClose, onAlunoExcluido }) => {
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [errorDelete, setErrorDelete] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!aluno) return;

    setLoadingDelete(true);
    setErrorDelete(null);

    try {
      const { error } = await supabase
        .from('alunos')
        .delete()
        .eq('id', aluno.id);

      if (error) {
        console.error("Erro ao excluir aluno:", error);
        throw new Error("Não foi possível excluir o atleta. Tente novamente.");
      }

      setLoadingDelete(false);
      onAlunoExcluido(); // Fecha o modal e recarrega a lista

    } catch (err: any) {
      setErrorDelete(err.message);
      setLoadingDelete(false);
    }
  };

  if (!aluno) return null; // Não renderiza se não houver aluno para excluir

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl z-10 w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-center mb-4">
          <AlertTriangle className="w-10 h-10 text-red-500 mr-3" />
          <h2 className="text-xl font-bold text-white">Confirmar Exclusão</h2>
        </div>

        <p className="text-gray-300 text-center mb-6">
          Tem certeza que deseja excluir o atleta <strong className="text-white">{aluno.nome_aluno}</strong>? Esta ação não pode ser desfeita.
        </p>

        {errorDelete && <p className="text-red-400 bg-red-900/50 p-3 rounded mb-4 text-center">{errorDelete}</p>}

        <div className="flex justify-center space-x-4">
          <button onClick={onClose} disabled={loadingDelete} className="btn-secondary">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loadingDelete}
            className="btn-danger flex items-center" // Usaremos uma classe btn-danger
          >
            {loadingDelete ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {loadingDelete ? 'Excluindo...' : 'Confirmar Exclusão'}
          </button>
        </div>
      </div>
       {/* Adiciona estilo para btn-danger */}
       <style jsx global>{`
        /* ... outros estilos ... */
        .btn-danger {
            padding-left: 1.25rem; padding-right: 1.25rem; padding-top: 0.5rem; padding-bottom: 0.5rem;
            border-radius: 0.5rem;
            background-color: rgb(220 38 38 / 1); /* bg-red-600 */
            color: rgb(255 255 255 / 1); /* text-white */
            font-weight: 600; /* font-semibold */
            transition-property: background-color; transition-duration: 200ms;
        }
        .btn-danger:hover {
            background-color: rgb(185 28 28 / 1); /* hover:bg-red-700 */
        }
        .btn-danger:disabled {
             opacity: 0.7; cursor: not-allowed;
         }
      `}</style>
    </div>
  );
};

export default ModalConfirmarExclusao;
