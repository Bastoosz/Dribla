import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { FileText, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
interface DashboardData {
  totalAlunos: number;
  atrasadosCount: number;
  proximosCount: number;
  pagosCount: number;
  pendentesCount: number;
  receitaTotal: number;
  receitaPendente: number;
}
interface ModalGerarRelatorioProps {
  isOpen: boolean;
  onClose: () => void;
  data: DashboardData;
}
export function ModalGerarRelatorio({ isOpen, onClose, data }: ModalGerarRelatorioProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const reportDate = new Date().toLocaleDateString('pt-BR');
  
  React.useEffect(() => {
    if (isOpen) {
      console.log('ModalGerarRelatorio opened with data:', data);
    }
  }, [isOpen, data]);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  const totalAlunos = data?.totalAlunos ?? 0;
  const receitaTotalVal = data?.receitaTotal ?? 0;
  const receitaPendenteVal = data?.receitaPendente ?? 0;
  const receitaRecebidaPct = receitaTotalVal > 0 ? ((receitaTotalVal - receitaPendenteVal) / receitaTotalVal) * 100 : 0;
  const inadimplenciaPct = receitaTotalVal > 0 ? (receitaPendenteVal / receitaTotalVal) * 100 : 0;
  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const report = document.getElementById('report-content');
      if (!report) return;
      const canvas = await html2canvas(report, {
        scale: 2,
        backgroundColor: '#1F2937', 
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const aspectRatio = canvas.width / canvas.height;
      let imgWidth = pageWidth - 20; 
      let imgHeight = imgWidth / aspectRatio;
      if (imgHeight > pageHeight - 20) {
        imgHeight = pageHeight - 20;
        imgWidth = imgHeight * aspectRatio;
      }
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      
      pdf.save(`dribla-relatorio-${reportDate.replace(/\//g, '-')}.pdf`);
    } finally {
      setIsGenerating(false);
      onClose();
    }
  };
  return (
    <Modal
      title="Gerar Relatório"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto">
        {}
        <div 
          id="report-content" 
          className="bg-gray-800 rounded-lg p-6 space-y-8"
        >
          <div className="text-center border-b border-gray-700 pb-4">
            <h2 className="text-2xl font-bold text-white">Relatório Dribla</h2>
            <p className="text-gray-400">{reportDate}</p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-dribla-green">Visão Geral</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/50 rounded p-4">
                <p className="text-gray-400 text-sm mb-2">Total de Alunos</p>
                <p className="text-3xl font-bold text-white">{totalAlunos}</p>
              </div>
              <div className="bg-gray-700/50 rounded p-4">
                <p className="text-gray-400 text-sm mb-2">Taxa de Inadimplência</p>
                <p className="text-3xl font-bold text-white">
                  {inadimplenciaPct.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-dribla-green">Análise Financeira</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-700/50 rounded p-4">
                  <p className="text-gray-400 text-sm mb-1">Receita Total</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(data.receitaTotal)}</p>
                </div>
                <div className="bg-gray-700/50 rounded p-4">
                  <p className="text-gray-400 text-sm mb-1">Receita Pendente</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(data.receitaPendente)}</p>
                </div>
              </div>
              
              <div className="bg-gray-700/30 rounded-lg p-4 flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 rounded-full border-8 border-gray-600" />
                  <div 
                    className="absolute inset-0 rounded-full border-8 border-dribla-green"
                    style={{
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((receitaRecebidaPct / 100) * 2 * Math.PI - Math.PI / 2)}% ${50 + 50 * Math.sin((receitaRecebidaPct / 100) * 2 * Math.PI - Math.PI / 2)}%)`
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-lg font-bold text-white">
                      {Math.round(receitaRecebidaPct)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-700/30 rounded p-4 space-y-2">
              <h4 className="font-semibold text-white">Insights</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• {data.pagosCount} alunos ({(totalAlunos > 0 ? ((data.pagosCount / totalAlunos) * 100).toFixed(0) : '0')}%) estão com pagamentos em dia</li>
                <li>• {data.atrasadosCount} mensalidades ({(totalAlunos > 0 ? ((data.atrasadosCount / totalAlunos) * 100).toFixed(0) : '0')}%) precisam de atenção imediata</li>
                <li>• {data.proximosCount} mensalidades vencem nos próximos dias</li>
                <li>• {formatCurrency(data.receitaTotal - data.receitaPendente)} já recebido este mês</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-gray-900 pt-4">
          <div className="flex flex-col space-y-4">
            <Button
              onClick={generatePDF}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Exportar Relatório PDF
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full"
              disabled={isGenerating}
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}