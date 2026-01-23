import jsPDF from 'jspdf';
import { Auction, Lead } from '../../types';

export const generateAutoArrematacao = (auction: Auction, arrematante: Lead) => {
  const doc = new jsPDF();
  
  // Configurações de fonte
  doc.setFont('times', 'normal');
  
  // Título
  doc.setFontSize(16);
  doc.setFont('times', 'bold');
  doc.text('AUTO DE ARREMATAÇÃO', 105, 20, { align: 'center' });
  
  // Dados do Processo
  doc.setFontSize(12);
  doc.setFont('times', 'normal');
  
  let y = 40;
  const lineHeight = 10;
  
  doc.text(`PROCESSO Nº: ${auction.process_number}`, 20, y);
  y += lineHeight;
  doc.text(`VARA/COMARCA: ${auction.vara || 'Não informado'}`, 20, y);
  y += lineHeight * 1.5;
  
  // Texto Corpo
  const today = new Date().toLocaleDateString('pt-BR');
  const text = `Aos ${today}, compareceu o arrematante abaixo qualificado, que ofereceu lance vencedor para aquisição do bem descrito neste auto.`;
  
  const splitText = doc.splitTextToSize(text, 170);
  doc.text(splitText, 20, y);
  y += lineHeight * 3;
  
  // Dados do Arrematante
  doc.setFont('times', 'bold');
  doc.text('DADOS DO ARREMATANTE:', 20, y);
  y += lineHeight;
  
  doc.setFont('times', 'normal');
  doc.text(`Nome: ${arrematante.name}`, 20, y);
  y += lineHeight;
  doc.text(`CPF/CNPJ: ${arrematante.cpf_cnpj || '-'}`, 20, y);
  y += lineHeight;
  doc.text(`Endereço: ${arrematante.address || '-'}`, 20, y);
  y += lineHeight;
  doc.text(`Email: ${arrematante.email || '-'}`, 20, y);
  y += lineHeight;
  doc.text(`Telefone: ${arrematante.phone || '-'}`, 20, y);
  y += lineHeight * 2;
  
  // Descrição do Bem
  doc.setFont('times', 'bold');
  doc.text('DESCRIÇÃO DO BEM:', 20, y);
  y += lineHeight;
  
  doc.setFont('times', 'normal');
  const descText = doc.splitTextToSize(auction.description || '', 170);
  doc.text(descText, 20, y);
  y += (descText.length * lineHeight) + lineHeight;
  
  // Valores
  doc.text(`Valor da Avaliação: R$ ${auction.valuation_value?.toFixed(2) || '0,00'}`, 20, y);
  y += lineHeight;
  doc.text(`Lance Mínimo: R$ ${auction.minimum_bid?.toFixed(2) || '0,00'}`, 20, y);
  y += lineHeight * 3;
  
  // Assinaturas
  doc.line(20, y, 90, y); // Linha Arrematante
  doc.line(110, y, 180, y); // Linha Leiloeiro
  
  y += 5;
  doc.setFontSize(10);
  doc.text('Arrematante', 55, y, { align: 'center' });
  doc.text('Leiloeiro Oficial', 145, y, { align: 'center' });
  
  // Rodapé
  doc.setFontSize(8);
  doc.text('Este documento foi gerado automaticamente pelo Sistema E-Lance Franquias.', 105, 280, { align: 'center' });
  
  // Salvar/Baixar
  doc.save(`Auto_Arrematacao_${auction.process_number}.pdf`);
};
