/* ============================================================
   DADOS — edite aqui para adicionar/alterar eventos.
   Cada linha: { titulo, inicio: "AAAA-MM-DD", fim: "AAAA-MM-DD",
                 periodoCompleto: true (opcional — mostra o evento em
                 TODOS os dias do período; use em provas. Sem essa flag,
                 eventos longos aparecem só no dia de início e de término) }
   ============================================================ */
/* ============================================================
   LINK DO CRONOGRAMA EM PDF
   Cole abaixo o link do arquivo no Google Drive.
   Dica: use o link de compartilhamento com acesso "qualquer pessoa com o link".
   ============================================================ */
const LINK_CRONOGRAMA_PDF = "https://drive.google.com/file/d/1-Cn5JxdVC4PbvAO3RQneymELgaYiVzy7/view?usp=drive_link";

const EVENTOS = [
  { titulo:"Abertura das Salas", inicio:"2026-08-04", fim:"2026-08-04",
    descricao:"Abertura das salas virtuais da disciplina para início das atividades do 1º Bimestre." },
  { titulo:"Fórum de Aprendizagem Avaliativo — 1º Bimestre", inicio:"2026-08-11", fim:"2026-09-04",
    descricao:"Período para participar do fórum de aprendizagem avaliativo do 1º Bimestre." },
  { titulo:"Trabalho Final do Bimestre — 1º Bimestre",       inicio:"2026-08-11", fim:"2026-09-04",
    descricao:"Período para realização e envio do Trabalho Final do 1º Bimestre." },
  { titulo:"Exercícios Online — 1º Bimestre",                inicio:"2026-08-11", fim:"2026-09-04",
    descricao:"Período para realização dos exercícios online do 1º Bimestre." },
  { titulo:"Prova Presencial — 1º Bimestre",                    inicio:"2026-09-21", fim:"2026-09-26", periodoCompleto:true,
    descricao:"Período de realização da Prova Presencial do 1º Bimestre." },
  { titulo:"Solicitação de Prova – 2ª Chamada", inicio:"2026-09-21", fim:"2026-09-26",
    descricao:"Período para solicitar a Prova de 2ª Chamada, mediante requerimento com justificativa legal no Portal do Aluno." },
  { titulo:"Prova 2ª Chamada – Presencial",    inicio:"2026-09-28", fim:"2026-09-29", periodoCompleto:true,
    descricao:"Período de realização da Prova de 2ª Chamada, de forma presencial." },
  { titulo:"Liberação dos Resultados (Prova, Fórum, Exercícios e Trabalho)", inicio:"2026-10-14", fim:"2026-10-14",
    descricao:"Data limite para liberação dos resultados de Prova, Fórum, Exercícios e Trabalho na plataforma." },
  { titulo:"Importação das Notas para o Sistema Acadêmico", inicio:"2026-10-15", fim:"2026-10-15",
    descricao:"Importação das notas do 1º Bimestre para o Sistema Acadêmico, no Portal do Aluno." },
];

document.addEventListener("DOMContentLoaded", function(){
  if (window.lucide) lucide.createIcons();

  const $ = s => document.querySelector(s);
  const today = new Date(); today.setHours(0,0,0,0);
  const DIAS = ["DOM","SEG","TER","QUA","QUI","SEX","SÁB"];
  const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

  const pd = s => new Date(s + "T00:00:00");
  const dUntil = s => Math.ceil((pd(s) - today) / 86400000);
  const fmt = d => String(d.getDate()).padStart(2,"0") + "/" + String(d.getMonth()+1).padStart(2,"0");
  const sameDay = (a,b) => a.getTime() === b.getTime();

  /* ---------- status de cada evento ---------- */
  EVENTOS.forEach(ev => {
    const ini = pd(ev.inicio), fim = pd(ev.fim);
    if (fim < today) ev.status = "past";
    else if (ini > today) ev.status = "future";
    else {
      const d = dUntil(ev.fim);
      ev.status = d <= 3 ? "upcoming-3" : (d <= 7 ? "upcoming-7" : "upcoming");
    }
  });

  /* ---------- barra: andamento do calendário (tempo) ---------- */
  const iniCal = EVENTOS.reduce((m,e)=> pd(e.inicio) < m ? pd(e.inicio) : m, pd(EVENTOS[0].inicio));
  const fimCal = EVENTOS.reduce((m,e)=> pd(e.fim)   > m ? pd(e.fim)   : m, pd(EVENTOS[0].fim));
  const totalDias = Math.round((fimCal - iniCal)/86400000) + 1;
  let diaAtual = Math.round((today - iniCal)/86400000) + 1;
  if (diaAtual < 0) diaAtual = 0;
  if (diaAtual > totalDias) diaAtual = totalDias;
  const pct = totalDias > 0 ? Math.round(diaAtual/totalDias*100) : 0;
  $("#xpFill").style.width = pct + "%";
  $("#progLabel").textContent = diaAtual === 0
    ? "O calendário ainda não começou"
    : `Andamento do calendário · dia ${diaAtual} de ${totalDias}`;
  $("#progPct").textContent = pct + "%";

  /* ---------- próximo prazo ---------- */
  let next = null, nextDays = Infinity, nextIsStart = false;
  EVENTOS.forEach(ev => {
    if (ev.status === "past") return;
    const ref = ev.status === "future" ? ev.inicio : ev.fim;
    const d = dUntil(ref);
    if (d >= 0 && d < nextDays){ nextDays = d; next = ev; nextIsStart = ev.status === "future"; }
  });
  if (next){
    $("#neTitle").textContent = next.titulo;
    $("#neCount").textContent = nextDays === 0 ? "é hoje!" :
      (nextIsStart ? `inicia em ${nextDays}d` : `encerra em ${nextDays}d`);
    $("#nextEvent").style.display = "flex";
  }

  /* ---------- meses a renderizar (do primeiro ao último evento) ---------- */
  const minD = EVENTOS.reduce((m,e)=> pd(e.inicio) < m ? pd(e.inicio) : m, pd(EVENTOS[0].inicio));
  const maxD = EVENTOS.reduce((m,e)=> pd(e.fim)   > m ? pd(e.fim)   : m, pd(EVENTOS[0].fim));
  const months = [];
  let cur = new Date(minD.getFullYear(), minD.getMonth(), 1);
  const endM = new Date(maxD.getFullYear(), maxD.getMonth(), 1);
  while (cur <= endM){ months.push(new Date(cur)); cur.setMonth(cur.getMonth()+1); }

  const eventsOn = day => EVENTOS.filter(ev => pd(ev.inicio) <= day && day <= pd(ev.fim));

  /* Como o evento aparece em um dia específico:
     - evento de 1 dia ou com periodoCompleto: aparece em todos os dias do intervalo
     - evento longo sem a flag: aparece só no dia de início ("Início") e de término ("Término") */
  function displayOn(ev, day){
    const ini = pd(ev.inicio), fim = pd(ev.fim);
    const single = ev.inicio === ev.fim;
    if (single || ev.periodoCompleto) return { show:true, tag:null };
    if (sameDay(day, ini)) return { show:true, tag:"Início" };
    if (sameDay(day, fim)) return { show:true, tag:"Término" };
    return { show:false };
  }

  /* ---------- GRADE (desktop) ---------- */
  const calContainer = $("#calContainer");

  const navEl = document.createElement("div");
  navEl.className = "mes-nav cal-wrap";
  navEl.innerHTML = `
    <button class="mes-nav-btn" id="mesPrev" aria-label="Mês anterior"><i data-lucide="chevron-left" class="icon"></i></button>
    <div class="mes-nav-titulo" id="mesTitulo">—</div>
    <button class="mes-nav-btn" id="mesNext" aria-label="Próximo mês"><i data-lucide="chevron-right" class="icon"></i></button>`;
  calContainer.appendChild(navEl);

  const blocosMes = [];
  months.forEach(m0 => {
    const year = m0.getFullYear(), month = m0.getMonth();
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month+1, 0).getDate();

    const block = document.createElement("div");
    block.className = "month-block cal-wrap";
    block.innerHTML = `<h2><i data-lucide="calendar" class="icon"></i> ${MESES[month]} ${year}</h2>`;

    const cal = document.createElement("div");
    cal.className = "cal";
    cal.innerHTML = `<div class="cal-head">${DIAS.map(d=>`<div>${d}</div>`).join("")}</div>`;

    const grid = document.createElement("div");
    grid.className = "cal-grid";

    // células vazias antes do dia 1 (mostrando dias do mês anterior esmaecidos)
    const prevDays = new Date(year, month, 0).getDate();
    for (let i = firstDow-1; i >= 0; i--){
      grid.insertAdjacentHTML("beforeend",
        `<div class="cal-cell other"><div class="cal-day">${prevDays - i}</div></div>`);
    }

    for (let d = 1; d <= daysInMonth; d++){
      const day = new Date(year, month, d);
      const cell = document.createElement("div");
      cell.className = "cal-cell" + (sameDay(day, today) ? " today" : "");
      cell.innerHTML = `<div class="cal-day">${d}</div>`;
      eventsOn(day).forEach(ev => {
        const disp = displayOn(ev, day);
        if (!disp.show) return;
        const per = ev.inicio === ev.fim ? fmt(pd(ev.inicio)) : `${fmt(pd(ev.inicio))} a ${fmt(pd(ev.fim))}`;
        const tagTxt = disp.tag ? `${disp.tag} · ` : "";
        const idx = EVENTOS.indexOf(ev);
        cell.insertAdjacentHTML("beforeend",
          `<div class="pill ${ev.status}" data-ev-idx="${idx}" title="${ev.titulo} (${per})">
             ${tagTxt}${ev.titulo}
             <span class="pdate mono">${per}</span>
           </div>`);
      });
      grid.appendChild(cell);
    }

    // completa a última semana
    const totalCells = firstDow + daysInMonth;
    const trailing = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= trailing; i++){
      grid.insertAdjacentHTML("beforeend",
        `<div class="cal-cell other"><div class="cal-day">${i}</div></div>`);
    }

    cal.appendChild(grid);
    block.appendChild(cal);
    calContainer.appendChild(block);
    blocosMes.push(block);
  });

  /* ---------- navegação entre meses (desktop) ---------- */
  let mesAtivo = months.findIndex(m =>
    m.getFullYear() === today.getFullYear() && m.getMonth() === today.getMonth());
  if (mesAtivo === -1) mesAtivo = 0;

  function mostrarMes(i){
    mesAtivo = i;
    blocosMes.forEach((b, idx) => b.classList.toggle("mes-oculto", idx !== i));
    $("#mesTitulo").textContent = `${MESES[months[i].getMonth()]} ${months[i].getFullYear()}`;
    $("#mesPrev").disabled = (i === 0);
    $("#mesNext").disabled = (i === months.length - 1);
  }

  $("#mesPrev").addEventListener("click", ()=>{ if (mesAtivo > 0) mostrarMes(mesAtivo - 1); });
  $("#mesNext").addEventListener("click", ()=>{ if (mesAtivo < months.length - 1) mostrarMes(mesAtivo + 1); });

  mostrarMes(mesAtivo);

  /* ---------- AGENDA (mobile): só dias com evento ---------- */
  const agenda = $("#agendaContainer");
  months.forEach(m0 => {
    const year = m0.getFullYear(), month = m0.getMonth();
    const daysInMonth = new Date(year, month+1, 0).getDate();
    let monthHasContent = false;
    const mBlock = document.createElement("div");
    mBlock.className = "month-block";
    mBlock.innerHTML = `<h2><i data-lucide="calendar" class="icon"></i> ${MESES[month]} ${year}</h2>`;

    for (let d = 1; d <= daysInMonth; d++){
      const day = new Date(year, month, d);
      const evs = eventsOn(day)
        .map(ev => ({ ev, disp: displayOn(ev, day) }))
        .filter(x => x.disp.show);
      if (!evs.length && !sameDay(day,today)) continue;
      monthHasContent = true;

      const dayEl = document.createElement("div");
      dayEl.className = "agenda-day" + (sameDay(day,today) ? " today" : "");
      const dowName = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"][day.getDay()];
      dayEl.innerHTML = `<div class="agenda-date mono">${fmt(day)} — ${dowName}${sameDay(day,today)?" · HOJE":""}</div>`;

      if (evs.length){
        const list = document.createElement("div");
        list.className = "agenda-events";
        evs.forEach(({ev, disp}) => {
          const per = ev.inicio === ev.fim ? fmt(pd(ev.inicio)) : `${fmt(pd(ev.inicio))} a ${fmt(pd(ev.fim))}`;
          const tagTxt = disp.tag ? `${disp.tag} · ` : "";
          const idx = EVENTOS.indexOf(ev);
          list.insertAdjacentHTML("beforeend",
            `<div class="agenda-ev ${ev.status}" data-ev-idx="${idx}">${tagTxt}${ev.titulo}<small class="mono">${per}</small></div>`);
        });
        dayEl.appendChild(list);
      }
      mBlock.appendChild(dayEl);
    }
    if (monthHasContent) agenda.appendChild(mBlock);
  });

  if (window.lucide) lucide.createIcons();

  /* ---------- toast automático ---------- */
  const urgent = EVENTOS.filter(e => e.status === "upcoming-3")
                        .sort((a,b)=> dUntil(a.fim)-dUntil(b.fim))[0];
  if (urgent){
    setTimeout(()=>{
      const t = $("#toast");
      t.innerHTML = `<i data-lucide="alert-triangle" class="icon"></i> Atenção: <strong>${urgent.titulo}</strong> encerra em ${dUntil(urgent.fim)} dia(s)!`;
      t.classList.add("show");
      if (window.lucide) lucide.createIcons();
      setTimeout(()=> t.classList.remove("show"), 6000);
    }, 800);
  }

  /* ---------- abas ---------- */
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("panel-" + btn.dataset.tab).classList.add("active");
      window.scrollTo({ top:0, behavior:"smooth" });
    });
  });

  /* ---------- modal de detalhes do evento ---------- */
  const evOverlay = $("#eventModalOverlay");
  const evHead = $("#evHead"), evTitulo = $("#evTitulo"), evPeriodo = $("#evPeriodo");
  const evTagStatus = $("#evTagStatus"), evDescricao = $("#evDescricao");

  const STATUS_LABEL = {
    past: "Encerrado",
    "upcoming-3": "Encerra em até 3 dias",
    "upcoming-7": "Encerra em até 7 dias",
    upcoming: "Em andamento",
    future: "Ainda vai começar",
  };

  function abrirModalEvento(idx){
    const ev = EVENTOS[idx];
    if (!ev) return;
    const per = ev.inicio === ev.fim ? fmt(pd(ev.inicio)) : `${fmt(pd(ev.inicio))} a ${fmt(pd(ev.fim))}`;
    evHead.className = "event-modal-head status-" + ev.status;
    evTitulo.textContent = ev.titulo;
    evPeriodo.textContent = per;
    evTagStatus.textContent = STATUS_LABEL[ev.status] || "—";
    evDescricao.textContent = ev.descricao || "Sem descrição adicional para este evento.";
    evOverlay.classList.add("show");
    if (window.lucide) lucide.createIcons();
  }

  function fecharModalEvento(){ evOverlay.classList.remove("show"); }

  [calContainer, agenda].forEach(container => {
    container.addEventListener("click", e => {
      const alvo = e.target.closest(".pill, .agenda-ev");
      if (!alvo) return;
      abrirModalEvento(Number(alvo.dataset.evIdx));
    });
  });

  $("#closeEventModal").addEventListener("click", fecharModalEvento);
  evOverlay.addEventListener("click", e => { if (e.target === evOverlay) fecharModalEvento(); });

  /* ---------- modal + abertura do PDF ---------- */
  const overlay = $("#pdfModalOverlay"), ack = $("#ackCheckbox"), confirmBtn = $("#confirmPdf");
  $("#openPdfModal").addEventListener("click", ()=>{
    overlay.classList.add("show"); ack.checked = false; confirmBtn.classList.remove("enabled");
  });
  $("#cancelPdf").addEventListener("click", ()=> overlay.classList.remove("show"));
  overlay.addEventListener("click", e => { if (e.target === overlay) overlay.classList.remove("show"); });
  ack.addEventListener("change", ()=> confirmBtn.classList.toggle("enabled", ack.checked));
  confirmBtn.addEventListener("click", ()=>{
    if (!ack.checked) return;
    overlay.classList.remove("show");
    abrirPDF();
  });

  function abrirPDF(){
    if (!LINK_CRONOGRAMA_PDF || LINK_CRONOGRAMA_PDF.indexOf("COLE_AQUI") === 0){
      const t = $("#toast");
      t.innerHTML = '<i data-lucide="alert-triangle" class="icon"></i> O link do PDF ainda não foi configurado.';
      t.classList.add("show");
      if (window.lucide) lucide.createIcons();
      setTimeout(()=> t.classList.remove("show"), 5000);
      return;
    }
    window.open(LINK_CRONOGRAMA_PDF, "_blank", "noopener");
  }
});
