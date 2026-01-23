import { Gavel, School, Globe, TrendingUp, Building2, Scale, Users, FileText, Book, TableProperties, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { NavItem, ServiceItem, Testimonial, ComparisonItem, FaqItem, MaterialItem } from './types';
import React from 'react';

export const COLORS = {
  primary: '#151d38', // Dark Navy
  secondary: '#3a7ad1', // Bright Blue
  background: '#eff0f1', // Light Gray
  white: '#ffffff',
};

export const CONTACT_INFO = {
  address: "Av. Duque de Caxias 18-29, Bauru-SP, 17011-066, BR",
  phone: "(11) 94166-0975",
  email: "contato@e-lance.com.br",
  whatsappLink: "https://wa.me/5514998536254?text=Estou%20cansado%20de%20ser%20corretor%20da%20Caixa.%20Agora%20quero%20ser%20um%20leiloeiro.%20Pode%20me%20ajudar%3F"
};

export const SERVICES: ServiceItem[] = [
  {
    title: "Franquia",
    description: "Oportunidade para atuar como leiloeiro oficial com suporte e estrutura completos.",
    icon: <Gavel size={32} />,
    link: "franchise"
  },
  {
    title: "Escola E-Lance",
    description: "Capacitação prática para compradores, advogados, corretores de imóveis e leiloeiros.",
    icon: <School size={32} />,
    link: "escola"
  },
  {
    title: "Portal de Leilões",
    description: "Plataforma segura contendo ofertas de imóveis em leilão de toda a nossa rede.",
    icon: <Globe size={32} />,
    link: "portal"
  },
  {
    title: "Consultoria e Mentoria",
    description: "Orientação personalizada para compradores e investidores dominarem o mercado.",
    icon: <TrendingUp size={32} />,
    link: "consultoria"
  }
];

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "#", id: "home" },
  {
    label: "Ecossistema",
    href: "#about",
    subItems: [
      { label: "O Ecossistema", href: "#", id: "ecossistema" },
      { label: "Bid Invest", href: "#", id: "bid-invest" },
      { label: "Escola E-Lance", href: "#", id: "escola" },
      { label: "Sobre Nós", href: "#about" }
    ]
  },
  {
    label: "Soluções",
    href: "#services",
    subItems: [
      { label: "Franquia para Advogados", href: "#", id: "franchise" },
      { label: "Franquia para Corretores", href: "#", id: "franchise-broker" },
      { label: "Portal", href: "#portal" },
      { label: "Consultoria", href: "#", id: "consultoria" },
      { label: "Mentoria Trilha do Arrematante", href: "#", id: "mentoria" },
      { label: "Indique um Leilão", href: "#", id: "indique" },
      { label: "Escola de Leiloeiros", href: "#", id: "escola-leiloeiros" },
      { label: "Curso Imóveis", href: "#", id: "curso-imoveis" },
      { label: "Curso para Advogados", href: "#", id: "curso-advogados" },
      { label: "Downloads", href: "#", id: "downloads" },
      { label: "Leilão Detran (+1000 Veículos)", href: "/detran" },
      { label: "Artigos", href: "#articles" }
    ]
  },
  { label: "Contato", href: "#", id: "contact" },
];

// FRANCHISE PAGE CONTENT

export const FRANCHISE_BENEFITS = [
  {
    title: "Segmento Lucrativo",
    description: "Todos os dias são vendidos imóveis milionários em leilão. O leiloeiro recebe até 5% desse valor como comissão.",
    icon: <TrendingUp size={32} />
  },
  {
    title: "Baixo Investimento",
    description: "Você só precisa de um computador conectado à internet. Não há custo fixo mensal elevado. Possível atuar em Home Office.",
    icon: <Building2 size={32} />
  },
  {
    title: "Treinamento Constante",
    description: "Nossa equipe é responsável por todo treinamento operacional e fornecemos manuais completos para sua atuação.",
    icon: <School size={32} />
  },
  {
    title: "Material Jurídico",
    description: "Fornecemos todos os modelos de documentos necessários: editais, petições, contratos e fichas cadastrais.",
    icon: <Scale size={32} />
  }
];

export const FRANCHISE_COMPARISON: { solo: ComparisonItem; franchise: ComparisonItem } = {
  solo: {
    title: "Atuar Sozinho",
    items: [
      "Custo de registro na Junta Comercial mais alto",
      "Dificuldade burocrática de registro",
      "Tempo de atividade zero (dificulta credenciamentos)",
      "Nenhuma experiência prévia validada",
      "Sem suporte jurídico especializado"
    ]
  },
  franchise: {
    title: "Franquia E-Lance",
    items: [
      "Custos e burocracia do registro já solucionados",
      "Marca consolidada com longo tempo de atividade",
      "Mais de 21 anos de experiência no segmento",
      "Facilidade em novos credenciamentos (TJSP, TRT, Bancos)",
      "Suporte, manuais e modelos prontos"
    ]
  }
};

export const FRANCHISE_MATERIALS: MaterialItem[] = [
  {
    title: "Modelos de Documentos",
    description: "Documentos jurídicos essenciais: Petições, editais, contratos, autos de arrematação, notificações e mais.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1080"
  },
  {
    title: "Modelos de Manuais",
    description: "Manuais completos do franqueado para implantação, operação e gestão do seu negócio.",
    image: "https://images.unsplash.com/photo-1531312267124-cd1f431feb1e?auto=format&fit=crop&q=80&w=1080"
  },
  {
    title: "Planilhas Financeiras",
    description: "Ferramentas exclusivas para cálculos de taxas, royalties, lucratividade, Payback e projeções financeiras.",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1080"
  }
];

export const FRANCHISE_TESTIMONIALS: Testimonial[] = [
  {
    author: "Crepaldi Leilões",
    company: "Franqueado de Sucesso",
    description: "Eles começaram com apenas 1 funcionário trabalhando em meio período e hoje já realizaram mais de 200 leilões para o TJSP, Loteadoras, Imobiliárias e particulares. Faturamento superior a R$ 130.000,00 no último ano.",
    image: "https://storage.googleapis.com/production-hostgator-brasil-v1-0-3/873/1757873/wOfpXRsp/b80e1e34d28246c09375e0f82e1b4981",
    link: "https://www.crepaldileiloes.com.br"
  },
  {
    author: "DM Negócios Imobiliários",
    company: "Franqueado de Sucesso",
    description: "Imobiliária de sucesso na cidade de São José dos Campos contratou a franquia de leilões para agregar esta solução às suas opções de vendas. Atua em todo Vale do Paraíba e presta serviços a vários advogados associados.",
    image: "https://storage.googleapis.com/production-hostgator-brasil-v1-0-3/873/1757873/wOfpXRsp/61233d567ffe42439b066516fa441506"
  },
  {
    author: "Noélle Espeda",
    company: "Advocacia Especializada",
    description: "Escritório de advocacia especializado na área civil. Entrou para o grupo de franquias para solucionar processos fracassados de execução, prestando serviço a diversos outros escritórios.",
    image: "https://storage.googleapis.com/production-hostgator-brasil-v1-0-3/873/1757873/wOfpXRsp/9cf43a7e459c4394b2fd70518d84dd19",
    link: "https://www.facebook.com/noelle.garcia.5855"
  }
];

export const MENTOR_BIO = {
  name: "Jerônimo Pompeu",
  role: "Mentor e Especialista em Leilões",
  description: "Com mais de 21 anos de atuação no segmento de leilões, seja como gerente de leilões da Caixa Econômica Federal, como arrematante ou como leiloeiro, Jerônimo Pompeu é uma das maiores autoridades em leilões no Brasil.",
  credentials: [
    "Graduado em Publicidade e Propaganda pela USP",
    "Pós-graduado em Direito Imobiliário pelo Instituto Damásio",
    "MBA em Gestão de Empresas pela FGV",
    "Gerente do setor de leilões da Caixa por 5 anos",
    "Sócio-proprietário da Casa e Cia Negócios Imobiliários há 15 anos",
    "Corretor, Avaliador de Imóveis e Perito Judicial"
  ],
  image: "https://storage.googleapis.com/production-hostgator-brasil-v1-0-3/873/1757873/wOfpXRsp/2322b175ccc74a82a1b310f3df6727eb"
};

export const FRANCHISE_FAQ: FaqItem[] = [
  {
    question: "Quanto custa a Franquia?",
    answer: "Entre em contato com a nossa equipe para saber os valores do investimento e condições especiais."
  },
  {
    question: "Qual é o valor dos royalties?",
    answer: "Temos um modelo competitivo. Entre em contato com a nossa equipe para saber o valor das taxas atualizadas."
  },
  {
    question: "Posso parcelar o pagamento da taxa de Franquia?",
    answer: "Não, o valor é pago integralmente no ato da contratação para garantir o compromisso e a estrutura inicial."
  },
  {
    question: "Não sei nada de leilões, consigo atuar?",
    answer: "Sim! Você receberá todo treinamento, manuais e suporte necessários para operar no segmento milionário dos leilões com segurança."
  }
];

export const STATE_BONDS = [
  { state: "Acre", value: "R$ 40.000,00" },
  { state: "Alagoas", value: "R$ 50.000,00" },
  { state: "Amapá", value: "R$ 45.774,10" },
  { state: "Amazonas", value: "R$ 60.000,00" },
  { state: "Bahia", value: "R$ 30.000,00" },
  { state: "Ceará", value: "R$ 50.000,00" },
  { state: "Distrito Federal", value: "R$ 50.000,00" },
  { state: "Espírito Santo", value: "R$ 80.000,00" },
  { state: "Goiás", value: "R$ 45.000,00" },
  { state: "Maranhão", value: "R$ 50.000,00" },
  { state: "Mato Grosso do Sul", value: "R$ 100.000,00" },
  { state: "Mato Grosso", value: "R$ 40.000,00" },
  { state: "Minas Gerais", value: "R$ 80.000,00" },
  { state: "Pará", value: "R$ 15.000,00" },
  { state: "Paraíba", value: "R$ 30.000,00" },
  { state: "Paraná", value: "R$ 100.000,00" },
  { state: "Pernambuco", value: "R$ 40.000,00" },
  { state: "Piauí", value: "R$ 60.000,00" },
  { state: "Rio de Janeiro", value: "R$ 90.000,00" },
  { state: "Rio Grande do Norte", value: "R$ 30.000,00" },
  { state: "Rio Grande do Sul", value: "R$ 42.510,00" },
  { state: "Rondônia", value: "R$ 30.000,00" },
  { state: "Roraima", value: "R$ 20.000,00" },
  { state: "São Paulo", value: "R$ 120.000,00" },
  { state: "Santa Catarina", value: "R$ 70.000,00" },
  { state: "Sergipe", value: "R$ 20.000,00" },
  { state: "Tocantins", value: "R$ 50.000,00" }
];