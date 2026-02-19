import { useState, useRef, useCallback } from "react";
import { jsPDF } from "jspdf";

interface DadosPaciente {
  nome: string;
  nomeSocial: string;
  cpf: string;
  rg: string;
  telefone: string;
}

const CONTATO_WHATSAPP = "5544997112467";

function formatarCPF(valor: string): string {
  const nums = valor.replace(/\D/g, "").slice(0, 11);
  if (nums.length <= 3) return nums;
  if (nums.length <= 6) return `${nums.slice(0, 3)}.${nums.slice(3)}`;
  if (nums.length <= 9)
    return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`;
  return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`;
}

function formatarTelefone(valor: string): string {
  const nums = valor.replace(/\D/g, "").slice(0, 11);
  if (nums.length <= 2) return nums.length ? `(${nums}` : "";
  if (nums.length <= 7)
    return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
}

function gerarHash5(): number {
  return Math.floor(10000 + Math.random() * 90000);
}

function gerarPDF(dados: DadosPaciente): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 20;
  const marginRight = 20;
  const maxWidth = pageWidth - marginLeft - marginRight;
  let y = 20;
  const lineHeight = 6;
  const dataAtual = new Date().toLocaleDateString("pt-BR");

  const addTitle = (text: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(text, pageWidth / 2, y, { align: "center" });
    y += lineHeight + 4;
  };

  const addSubtitle = (text: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(text, marginLeft, y);
    y += lineHeight + 1;
  };

  const addParagraph = (text: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(text, maxWidth);
    for (const line of lines) {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, marginLeft, y);
      y += lineHeight - 1;
    }
    y += 3;
  };

  const addField = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(label, marginLeft, y);
    const labelWidth = doc.getTextWidth(label);
    doc.setFont("helvetica", "normal");
    doc.text(value, marginLeft + labelWidth + 1, y);
    y += lineHeight;
  };

  // Título
  addTitle("CONTRATO DE PSICOTERAPIA");

  // Intro
  addParagraph(
    "Eu, Giovana de Morais, Psicóloga (CRP 08/45995), e você, paciente abaixo identificado(a), firmamos este acordo com o objetivo de estabelecer clareza e segurança em nosso processo terapêutico."
  );

  y += 2;

  // Dados do paciente
  addSubtitle("Dados do(a) Paciente:");
  addField("Nome: ", dados.nome);
  if (dados.nomeSocial) {
    addField("Nome social: ", dados.nomeSocial);
  }
  addField("CPF: ", dados.cpf);
  addField("RG: ", dados.rg);
  addField("Telefone/WhatsApp: ", dados.telefone);

  y += 4;

  // Cláusulas
  addSubtitle("1. Sobre o atendimento:");
  addParagraph(
    "Nossas sessões de psicoterapia terão duração de aproximadamente 50 minutos e acontecerão semanalmente ou quinzenalmente em formato presencial em Maringá-PR ou on-line, conforme combinado."
  );

  addSubtitle("2. Valores e forma de pagamento:");
  addParagraph(
    "Cada sessão tem o valor de R$ 80,00 (social para estudantes e baixa renda) e R$100,00 valor convencional. O pagamento poderá ser realizado por: (PIX, Transferência ou Dinheiro). Sendo realizado até o dia 10 de cada mês, ou no dia das sessões."
  );

  addSubtitle("3. Cancelamentos e/ou faltas:");
  addParagraph(
    "Para que nosso processo tenha continuidade e respeito ao tempo de ambos: Se precisar cancelar, avise com no mínimo 24 horas de antecedência. Cancelamentos fora desse prazo ou faltas sem aviso terão a cobrança integral da sessão."
  );

  addSubtitle("4. Sigilo e ética:");
  addParagraph(
    "Tudo o que você compartilhar nas sessões será mantido em sigilo absoluto, conforme previsto no Código de Ética Profissional do Psicólogo. Somente em situações previstas por lei (ex.: risco à sua vida ou à de terceiros) o sigilo poderá ser quebrado."
  );
  addParagraph(
    "Em relação a psicoterapia realizada online, é necessário que o ambiente seja tranquilo, silencioso e reservado. Use fones de ouvido para mais privacidade e concentração. Além disso, verifique se a internet está funcionando bem e não esqueça de manter o celular ou computador carregado ou conectado na energia."
  );

  addSubtitle("5. Encerramento do processo:");
  addParagraph(
    "A psicoterapia é um processo construído em conjunto. Tanto você quanto eu podemos decidir pelo encerramento, sempre conversando abertamente sobre o momento mais adequado."
  );

  addSubtitle("6. Acordo de confiança:");
  addParagraph(
    "Este contrato não é apenas um documento, mas um acordo de confiança e respeito mútuo. Estamos aqui para construir um espaço seguro, acolhedor e transformador."
  );

  y += 8;

  // Local e data
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Local e data: Maringá, ${dataAtual}`, marginLeft, y);
  y += 14;

  // Assinatura do paciente
  doc.setFont("helvetica", "bold");
  doc.text("Assinatura do(a) Paciente:", marginLeft, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text(dados.nome, marginLeft, y);
  y += 4;
  doc.setFontSize(8);
  doc.text(`Assinado digitalmente em ${dataAtual}`, marginLeft, y);
  doc.setFontSize(10);

  y += 14;

  // Assinatura da psicóloga
  doc.setFont("helvetica", "bold");
  doc.text("Assinatura da Psicóloga:", marginLeft, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text("Giovana de Morais – CRP-08/45995", marginLeft, y);

  // Footer com marcação digital
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Documento assinado digitalmente por ${dados.nome} - CPF: ${dados.cpf} - ${dataAtual}`,
      pageWidth / 2,
      290,
      { align: "center" }
    );
    doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, 294, {
      align: "center",
    });
    doc.setTextColor(0, 0, 0);
  }

  return doc;
}

export function App() {
  const [dados, setDados] = useState<DadosPaciente>({
    nome: "",
    nomeSocial: "",
    cpf: "",
    rg: "",
    telefone: "",
  });
  const [etapa, setEtapa] = useState<"form" | "preview" | "sucesso">("form");
  const [carregando, setCarregando] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [githubSalvo, setGithubSalvo] = useState(false);
  const [nomeArquivoFinal, setNomeArquivoFinal] = useState("");
  const pdfDocRef = useRef<jsPDF | null>(null);

  const handleChange = useCallback(
    (campo: keyof DadosPaciente) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        let valor = e.target.value;
        if (campo === "cpf") valor = formatarCPF(valor);
        if (campo === "telefone") valor = formatarTelefone(valor);
        setDados((prev) => ({ ...prev, [campo]: valor }));
      },
    []
  );

  const validarFormulario = (): boolean => {
    if (!dados.nome.trim()) return false;
    if (dados.cpf.replace(/\D/g, "").length < 11) return false;
    if (!dados.rg.trim()) return false;
    if (dados.telefone.replace(/\D/g, "").length < 10) return false;
    return true;
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFormulario()) {
      alert("Preencha todos os campos obrigatórios corretamente.");
      return;
    }
    setEtapa("preview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAssinar = async () => {
    setCarregando(true);
    setGithubSalvo(false);

    try {
      const doc = gerarPDF(dados);
      pdfDocRef.current = doc;

      const pdfBlob = doc.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);

      const hash = gerarHash5();
      const nomeArquivo = `${hash}_${dados.nome.replace(/\s+/g, "_")}_Contrato.pdf`;
      setNomeArquivoFinal(nomeArquivo);

      // Caminho completo no GitHub: contratos/nome_arquivo.pdf
      const caminhoGitHub = `contratos/${nomeArquivo}`;

      // Converter para base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });

      // Enviar para o backend (que salva no GitHub em psigiovana/contratos-assinados)
      try {
        const response = await fetch("https://contratos-assinados.onrender.com/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nomeArquivo: caminhoGitHub,
            conteudoBase64: base64,
          }),
        });

        if (response.ok) {
          setGithubSalvo(true);
          console.log(`✅ Contrato salvo no GitHub: ${caminhoGitHub}`);
        } else {
          const errorText = await response.text();
          console.warn(`⚠️ Erro ao salvar no GitHub: ${response.status} - ${errorText}`);
        }
      } catch (uploadErr) {
        console.warn("⚠️ Falha ao enviar ao GitHub. O download continuará.", uploadErr);
      }

      // Download automático
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = nomeArquivo;
      downloadLink.click();

      // WhatsApp
      const msg = encodeURIComponent(
        `Olá Giovana, segue o contrato assinado por ${dados.nome}`
      );
      window.open(`https://wa.me/${CONTATO_WHATSAPP}?text=${msg}`, "_blank");

      setEtapa("sucesso");
    } catch (err) {
      alert("Erro ao gerar contrato: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setCarregando(false);
    }
  };

  const dataAtual = new Date().toLocaleDateString("pt-BR");

  return (
    <div className="min-h-screen bg-[#f3e8db]">
      {/* Header */}
      <header className="bg-white/60 backdrop-blur-sm shadow-sm py-4">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#f3e8db] flex items-center justify-center">
            <svg className="w-5 h-5 text-[#8b6f4e]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-[#5a4632]">Psicóloga Giovana de Morais</h1>
            <p className="text-xs text-[#8b6f4e]">CRP: 08/45995</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Etapa 1: Formulário */}
        {etapa === "form" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#5a4632] mb-2">
                  Contrato de Psicoterapia
                </h2>
                <p className="text-[#8b6f4e] text-sm">
                  Preencha seus dados para visualizar e assinar o contrato
                </p>
              </div>

              <form onSubmit={handlePreview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#5a4632] mb-1">
                    Nome completo <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={dados.nome}
                    onChange={handleChange("nome")}
                    placeholder="Digite seu nome completo"
                    className="w-full px-4 py-3 rounded-xl border border-[#e0d5c7] bg-[#faf6f1] text-[#5a4632] placeholder-[#b8a898] focus:outline-none focus:ring-2 focus:ring-[#d4b896] focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5a4632] mb-1">
                    Nome social <span className="text-[#b8a898] text-xs">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={dados.nomeSocial}
                    onChange={handleChange("nomeSocial")}
                    placeholder="Nome social, se houver"
                    className="w-full px-4 py-3 rounded-xl border border-[#e0d5c7] bg-[#faf6f1] text-[#5a4632] placeholder-[#b8a898] focus:outline-none focus:ring-2 focus:ring-[#d4b896] focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#5a4632] mb-1">
                      CPF <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={dados.cpf}
                      onChange={handleChange("cpf")}
                      placeholder="000.000.000-00"
                      className="w-full px-4 py-3 rounded-xl border border-[#e0d5c7] bg-[#faf6f1] text-[#5a4632] placeholder-[#b8a898] focus:outline-none focus:ring-2 focus:ring-[#d4b896] focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5a4632] mb-1">
                      RG <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={dados.rg}
                      onChange={handleChange("rg")}
                      placeholder="Número do RG"
                      className="w-full px-4 py-3 rounded-xl border border-[#e0d5c7] bg-[#faf6f1] text-[#5a4632] placeholder-[#b8a898] focus:outline-none focus:ring-2 focus:ring-[#d4b896] focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5a4632] mb-1">
                    Telefone / WhatsApp <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={dados.telefone}
                    onChange={handleChange("telefone")}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-3 rounded-xl border border-[#e0d5c7] bg-[#faf6f1] text-[#5a4632] placeholder-[#b8a898] focus:outline-none focus:ring-2 focus:ring-[#d4b896] focus:border-transparent transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3.5 bg-[#5a4632] text-white font-semibold rounded-xl hover:bg-[#7a6352] active:scale-[0.98] transition-all shadow-lg shadow-[#5a4632]/20"
                >
                  Visualizar Contrato
                </button>
              </form>
            </div>

            {/* Preview do contrato (resumido) */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h3 className="text-lg font-bold text-[#5a4632] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                Prévia do Contrato
              </h3>
              <div className="prose prose-sm max-w-none text-[#5a4632] space-y-3 text-sm leading-relaxed">
                <p className="font-medium">
                  Eu, Giovana de Morais, Psicóloga (CRP 08/45995), e você, paciente abaixo identificado(a), firmamos este acordo...
                </p>
                <p className="text-[#8b6f4e] italic text-xs">
                  Preencha seus dados acima e clique em "Visualizar Contrato" para ver o contrato completo com seus dados preenchidos.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Etapa 2: Preview completo */}
        {etapa === "preview" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => setEtapa("form")}
                className="flex items-center gap-1 text-[#5a4632] hover:text-[#8b6f4e] transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
                Voltar e editar dados
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10">
              <div className="border-b-2 border-[#e0d5c7] pb-6 mb-6 text-center">
                <h2 className="text-2xl font-bold text-[#5a4632]">CONTRATO DE PSICOTERAPIA</h2>
              </div>

              <div className="space-y-5 text-[#4a3f35] text-[15px] leading-relaxed">
                <p>
                  Eu, <strong>Giovana de Morais</strong>, Psicóloga (CRP 08/45995), e você, paciente abaixo
                  identificado(a), firmamos este acordo com o objetivo de estabelecer clareza e segurança em
                  nosso processo terapêutico.
                </p>

                <div className="bg-[#faf6f1] rounded-xl p-5 border border-[#e0d5c7]">
                  <h3 className="font-bold text-[#5a4632] mb-3">Dados do(a) Paciente:</h3>
                  <div className="space-y-1.5 text-sm">
                    <p><strong>Nome:</strong> {dados.nome}</p>
                    {dados.nomeSocial && <p><strong>Nome social:</strong> {dados.nomeSocial}</p>}
                    <p><strong>CPF:</strong> {dados.cpf}</p>
                    <p><strong>RG:</strong> {dados.rg}</p>
                    <p><strong>Telefone/WhatsApp:</strong> {dados.telefone}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-[#5a4632] mb-2">1. Sobre o atendimento:</h3>
                  <p>
                    Nossas sessões de psicoterapia terão duração de aproximadamente 50 minutos e acontecerão
                    semanalmente ou quinzenalmente em formato presencial em Maringá-PR ou on-line, conforme
                    combinado.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-[#5a4632] mb-2">2. Valores e forma de pagamento:</h3>
                  <p>
                    Cada sessão tem o valor de R$ 80,00 (social para estudantes e baixa renda) e R$100,00
                    valor convencional. O pagamento poderá ser realizado por: (PIX, Transferência ou
                    Dinheiro). Sendo realizado até o dia 10 de cada mês, ou no dia das sessões.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-[#5a4632] mb-2">3. Cancelamentos e/ou faltas:</h3>
                  <p>
                    Para que nosso processo tenha continuidade e respeito ao tempo de ambos: Se precisar
                    cancelar, avise com no mínimo 24 horas de antecedência. Cancelamentos fora desse prazo
                    ou faltas sem aviso terão a cobrança integral da sessão.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-[#5a4632] mb-2">4. Sigilo e ética:</h3>
                  <p>
                    Tudo o que você compartilhar nas sessões será mantido em sigilo absoluto, conforme
                    previsto no Código de Ética Profissional do Psicólogo. Somente em situações previstas por
                    lei (ex.: risco à sua vida ou à de terceiros) o sigilo poderá ser quebrado.
                  </p>
                  <p className="mt-3">
                    Em relação a psicoterapia realizada online, é necessário que o ambiente seja tranquilo,
                    silencioso e reservado. Use fones de ouvido para mais privacidade e concentração. Além
                    disso, verifique se a internet está funcionando bem e não esqueça de manter o celular ou
                    computador carregado ou conectado na energia.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-[#5a4632] mb-2">5. Encerramento do processo:</h3>
                  <p>
                    A psicoterapia é um processo construído em conjunto. Tanto você quanto eu podemos decidir
                    pelo encerramento, sempre conversando abertamente sobre o momento mais adequado.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-[#5a4632] mb-2">6. Acordo de confiança:</h3>
                  <p>
                    Este contrato não é apenas um documento, mas um acordo de confiança e respeito mútuo.
                    Estamos aqui para construir um espaço seguro, acolhedor e transformador.
                  </p>
                </div>

                <div className="border-t-2 border-[#e0d5c7] pt-6 mt-6 space-y-5">
                  <p className="text-sm text-[#8b6f4e]">
                    Local e data: Maringá, {dataAtual}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#faf6f1] rounded-xl p-4 border border-[#e0d5c7]">
                      <p className="text-xs text-[#8b6f4e] mb-1">Assinatura do(a) Paciente:</p>
                      <p className="font-semibold text-[#5a4632]">{dados.nome}</p>
                      <p className="text-xs text-[#b8a898] mt-1">Assinado digitalmente em {dataAtual}</p>
                    </div>
                    <div className="bg-[#faf6f1] rounded-xl p-4 border border-[#e0d5c7]">
                      <p className="text-xs text-[#8b6f4e] mb-1">Assinatura da Psicóloga:</p>
                      <p className="font-semibold text-[#5a4632]">Giovana de Morais</p>
                      <p className="text-xs text-[#b8a898] mt-1">CRP-08/45995</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botão de assinar */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start gap-3 mb-5 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <p className="text-sm text-amber-800">
                  Ao clicar em "Assinar Contrato", você confirma que leu e concorda com todos os termos
                  acima. O contrato será gerado em PDF, salvo automaticamente e enviado via WhatsApp.
                </p>
              </div>

              <button
                onClick={handleAssinar}
                disabled={carregando}
                className="w-full py-4 bg-[#5a4632] text-white font-bold text-lg rounded-xl hover:bg-[#7a6352] active:scale-[0.98] transition-all shadow-lg shadow-[#5a4632]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {carregando ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Gerando contrato...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    Assinar Contrato
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Etapa 3: Sucesso */}
        {etapa === "sucesso" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#5a4632] mb-2">Contrato Assinado!</h2>
              <p className="text-[#8b6f4e] mb-6">
                Seu contrato foi assinado, salvo e enviado com sucesso.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl text-sm text-green-700">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  PDF gerado e baixado automaticamente
                </div>

                {githubSalvo ? (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl text-sm text-green-700">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <div className="text-left">
                      <p>Contrato salvo no GitHub com sucesso</p>
                      <p className="text-xs text-green-600 mt-0.5">
                        📁 contratos/{nomeArquivoFinal}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl text-sm text-amber-700 border border-amber-200">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                    <div className="text-left">
                      <p>Não foi possível salvar no GitHub</p>
                      <p className="text-xs text-amber-600 mt-0.5">
                        O PDF foi baixado no seu dispositivo
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl text-sm text-green-700">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Mensagem enviada via WhatsApp
                </div>
              </div>

              {pdfUrl && (
                <a
                  href={pdfUrl}
                  download={`Contrato_${dados.nome.replace(/\s+/g, "_")}.pdf`}
                  className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-[#5a4632] text-white font-semibold rounded-xl hover:bg-[#7a6352] transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Baixar PDF novamente
                </a>
              )}

              <button
                onClick={() => {
                  setDados({ nome: "", nomeSocial: "", cpf: "", rg: "", telefone: "" });
                  setEtapa("form");
                  setPdfUrl(null);
                  setGithubSalvo(false);
                  setNomeArquivoFinal("");
                }}
                className="block mx-auto mt-4 text-sm text-[#8b6f4e] hover:text-[#5a4632] underline transition-colors"
              >
                Assinar novo contrato
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-[#b8a898]">
        <p>Psicóloga Giovana de Morais • CRP 08/45995</p>
        <p className="mt-1">Sistema de assinatura digital de contratos</p>
      </footer>
    </div>
  );
}
