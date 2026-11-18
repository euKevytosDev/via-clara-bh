import './style.css'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { places, bhCenter } from './corridors.js'
import { simulateRoute } from './simulator.js'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const placeOptions = places
  .map((p) => `<option value="${p.id}">${p.label}</option>`)
  .join('')

document.querySelector('#app').innerHTML = `
  <header class="nav" id="nav">
    <div class="container nav__inner">
      <a class="brand" href="#topo">ViaClara <span>BH</span> <small>Mobilidade e Cia</small></a>
      <nav class="nav__links" aria-label="Seções">
        <a href="#problema">Problema</a>
        <a href="#solucao">Solução</a>
        <a href="#simulador">Simulador</a>
        <a href="#ods">ODS 11</a>
      </nav>
      <a class="nav__cta" href="#simulador">Testar rota</a>
    </div>
  </header>

  <main id="topo">
    <section class="hero">
      <div class="hero__media" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1544620341-609bcdbae563?auto=format&fit=crop&w=2000&q=80"
          alt=""
          width="2000"
          height="1333"
        />
        <div class="hero__veil"></div>
      </div>
      <div class="container hero__content">
        <p class="eyebrow">Cidades inteligentes · Belo Horizonte</p>
        <h1>ViaClara <em>BH</em></h1>
        <p class="hero__lead">
          Landing educativa da Mobilidade e Cia para entender o congestionamento,
          simular rotas mais rápidas e estimar impacto ambiental no deslocamento urbano.
        </p>
        <div class="hero__actions">
          <a class="btn btn--primary" href="#simulador">Abrir simulador de rotas</a>
          <a class="btn btn--ghost" href="#solucao">Ver como funciona</a>
        </div>
        <div class="hero__meta">
          <div><strong>6</strong> corredores críticos mapeados</div>
          <div><strong>ODS 11</strong> metas 11.6 e 11.7</div>
          <div><strong>Demo ao vivo</strong> para apresentação</div>
        </div>
      </div>
    </section>

    <section class="problem" id="problema">
      <div class="container">
        <div class="section-head reveal">
          <h2>BH perde tempo e qualidade do ar no trânsito parado</h2>
          <p>
            Corredores como Antônio Carlos, Cristiano Machado e Amazonas saturam em horários de pico.
            A ViaClara BH torna esse problema visível e acionável na apresentação.
          </p>
        </div>
        <div class="problem__grid">
          <article class="stat-card reveal">
            <strong>+40 min</strong>
            <span>atraso típico simulado em pico nos eixos principais</span>
          </article>
          <article class="stat-card reveal">
            <strong>07h–09h</strong>
            <span>janela crítica matinal com lentidão alta</span>
          </article>
          <article class="stat-card reveal">
            <strong>CO₂↑</strong>
            <span>para-e-anda eleva emissões por quilômetro rodado</span>
          </article>
        </div>
        <div class="split-visual">
          <figure class="reveal">
            <img
              src="https://images.unsplash.com/photo-1502481851512-e9e2529da23d?auto=format&fit=crop&w=1600&q=80"
              alt="Trânsito urbano congestionado à noite"
              width="1600"
              height="1066"
              loading="lazy"
            />
            <figcaption>Congestionamento urbano em horário de pico — imagem ilustrativa.</figcaption>
          </figure>
          <figure class="reveal">
            <img
              src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1400&q=80"
              alt="Vias urbanas com fluxo intenso de veículos"
              width="1400"
              height="933"
              loading="lazy"
            />
            <figcaption>Fluxo intenso em vias arteriais — referência visual para a demo.</figcaption>
          </figure>
        </div>
      </div>
    </section>

    <section id="solucao">
      <div class="container">
        <div class="section-head reveal">
          <h2>Uma landing que ensina e demonstra na prática</h2>
          <p>
            Além do conteúdo institucional, a plataforma entrega uma ferramenta interativa
            para a banca: origem, destino, horário e resposta imediata.
          </p>
        </div>
        <div class="feature-grid">
          <article class="feature reveal">
            <div class="feature__icon">01</div>
            <h3>Alerta de pico</h3>
            <p>Detecta gargalos em corredores de BH conforme o horário escolhido.</p>
          </article>
          <article class="feature reveal">
            <div class="feature__icon">02</div>
            <h3>Rota alternativa</h3>
            <p>Sugere desvio simulado com economia estimada de minutos.</p>
          </article>
          <article class="feature reveal">
            <div class="feature__icon">03</div>
            <h3>Janela ideal</h3>
            <p>Indica horário próximo com menor retenção para sair.</p>
          </article>
          <article class="feature reveal">
            <div class="feature__icon">04</div>
            <h3>Impacto ambiental</h3>
            <p>Estima redução de CO₂ ao evitar o para-e-anda — vínculo direto com ODS 11.</p>
          </article>
          <article class="feature reveal">
            <div class="feature__icon">05</div>
            <h3>Mapa interativo</h3>
            <p>Leaflet + OpenStreetMap com traçado do corredor crítico e da alternativa.</p>
          </article>
          <article class="feature reveal">
            <div class="feature__icon">06</div>
            <h3>Conteúdo educativo</h3>
            <p>Explica padrões de congestão e boas práticas de mobilidade inteligente.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="simulator" id="simulador">
      <div class="container">
        <div class="section-head reveal">
          <h2>Simulador inteligente de rotas</h2>
          <p>
            Escolha origem, destino e horário. O sistema calcula alerta, alternativa,
            melhor janela de saída e economia estimada de CO₂.
          </p>
        </div>

        <div class="sim-shell reveal">
          <form class="sim-form" id="sim-form">
            <h3>Planejar deslocamento</h3>
            <div class="field">
              <label for="from">Origem</label>
              <select id="from" name="from" required>
                ${placeOptions}
              </select>
            </div>
            <div class="field">
              <label for="to">Destino</label>
              <select id="to" name="to" required>
                ${placeOptions}
              </select>
            </div>
            <div class="field">
              <label for="time">Horário pretendido</label>
              <input id="time" name="time" type="time" value="07:30" required />
            </div>
            <button class="btn btn--primary" type="submit">Simular rota agora</button>
            <p style="margin:0;color:var(--muted);font-size:0.85rem">
              Dica para o pitch: teste 07:30 na Antônio Carlos (Pampulha → Centro).
            </p>
          </form>

          <div class="sim-map-wrap">
            <div class="map-note">Mapa real · OpenStreetMap</div>
            <div id="map" role="region" aria-label="Mapa de Belo Horizonte"></div>
          </div>

          <div class="results" id="results" aria-live="polite"></div>
        </div>
      </div>
    </section>

    <section id="como">
      <div class="container">
        <div class="section-head reveal">
          <h2>Como usar na apresentação</h2>
          <p>Em três passos você demonstra o produto completo para a professora.</p>
        </div>
        <div class="steps">
          <article class="step reveal">
            <h3>Escolher trajeto</h3>
            <p>Defina origem e destino entre pontos reais de Belo Horizonte.</p>
          </article>
          <article class="step reveal">
            <h3>Simular horário</h3>
            <p>Compare pico (07:30 / 18:00) com janelas mais livres.</p>
          </article>
          <article class="step reveal">
            <h3>Mostrar impacto</h3>
            <p>Apresente minutos economizados e CO₂ evitado na alternativa.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="ods" id="ods">
      <div class="container">
        <div class="ods__panel reveal">
          <span class="ods__badge">Agenda 2030</span>
          <h3>ODS 11 — Cidades e Comunidades Sustentáveis</h3>
          <p>
            O projeto apoia a meta 11.6 (reduzir impacto ambiental negativo per capita,
            inclusive qualidade do ar) e a meta 11.7 (espaços públicos mais seguros e acessíveis),
            ao educar sobre congestionamento e incentivar escolhas de deslocamento mais eficientes.
          </p>
          <div class="pill-row">
            <span class="pill">Meta 11.6 · qualidade do ar</span>
            <span class="pill">Meta 11.7 · cidade acessível</span>
            <span class="pill">Mobilidade inteligente</span>
            <span class="pill">UPx 1 · Newton Paiva</span>
          </div>
        </div>
      </div>
    </section>

    <section class="pitch">
      <div class="container">
        <div class="pitch__card reveal">
          <h2>Mobilidade e Cia · ViaClara BH</h2>
          <p>
            Produto acadêmico individual para UPx 1: landing page institucional + simulador
            interativo de rotas para Belo Horizonte. Dados de retenção e ganhos são estimativas
            didáticas para demonstração — sem custo de API paga.
          </p>
          <div class="hero__actions" style="margin-top:1.25rem">
            <a class="btn btn--primary" href="#simulador">Voltar ao simulador</a>
            <a class="btn btn--ghost" href="#topo">Ir ao início</a>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container footer__inner">
      <span>ViaClara BH · Mobilidade e Cia (instituição fictícia)</span>
      <span>Projeto UPx 1 · Cidades Inteligentes · Belo Horizonte</span>
    </div>
  </footer>
`

// Defaults for pitch demo
document.querySelector('#from').value = 'pampulha'
document.querySelector('#to').value = 'centro'

const map = L.map('map', {
  zoomControl: true,
  scrollWheelZoom: false,
}).setView(bhCenter, 12)

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap &copy; CARTO',
  subdomains: 'abcd',
  maxZoom: 19,
}).addTo(map)

let primaryLayer = null
let altLayer = null
let markersLayer = L.layerGroup().addTo(map)

function clearRoutes() {
  if (primaryLayer) {
    map.removeLayer(primaryLayer)
    primaryLayer = null
  }
  if (altLayer) {
    map.removeLayer(altLayer)
    altLayer = null
  }
  markersLayer.clearLayers()
}

function drawResult(result) {
  clearRoutes()

  primaryLayer = L.polyline(result.primaryPath, {
    color: result.level.key === 'high' ? '#ff5c5c' : result.level.key === 'medium' ? '#f5a623' : '#2dd4bf',
    weight: 6,
    opacity: 0.95,
  }).addTo(map)

  altLayer = L.polyline(result.alternative.path, {
    color: '#2dd4bf',
    weight: 5,
    opacity: 0.9,
    dashArray: '10 8',
  }).addTo(map)

  L.marker(result.origin).bindPopup(`Origem: ${result.origin.label}`).addTo(markersLayer)
  L.marker(result.destination).bindPopup(`Destino: ${result.destination.label}`).addTo(markersLayer)

  const bounds = L.latLngBounds([...result.primaryPath, ...result.alternative.path])
  map.fitBounds(bounds.pad(0.2))

  const results = document.querySelector('#results')
  results.classList.add('is-visible')
  results.innerHTML = `
    <div class="alert alert--${result.level.key}">
      <strong>${result.level.title} (${result.level.label})</strong>
      <span>${result.corridor.name} · horário ${result.time} · índice ${result.level.score}/100</span>
    </div>
    <div class="result-grid">
      <article class="result-card">
        <small>Rota alternativa</small>
        <strong>${result.alternative.name}</strong>
        <p>Tempo estimado na alternativa: ${result.alternative.minutes} min · economia de ${result.alternative.timeGainMin} min</p>
      </article>
      <article class="result-card">
        <small>Janela ideal de saída</small>
        <strong>${result.ideal.label}</strong>
        <p>Fluxo pode reduzir cerca de ${result.ideal.flowGainPct}% vs. o horário simulado</p>
      </article>
      <article class="result-card">
        <small>Impacto ambiental (ODS 11)</small>
        <strong>−${result.alternative.co2Kg} kg CO₂</strong>
        <p>Estimativa didática ao evitar retenção do corredor crítico</p>
      </article>
    </div>
    <ul class="tips">
      ${result.tips.map((t) => `<li>${t}</li>`).join('')}
    </ul>
  `
}

document.querySelector('#sim-form').addEventListener('submit', (event) => {
  event.preventDefault()
  const from = document.querySelector('#from').value
  const to = document.querySelector('#to').value
  const time = document.querySelector('#time').value

  try {
    const result = simulateRoute({ from, to, time })
    drawResult(result)
    document.querySelector('#results').scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  } catch (error) {
    const results = document.querySelector('#results')
    results.classList.add('is-visible')
    results.innerHTML = `
      <div class="alert alert--high">
        <strong>Não foi possível simular</strong>
        <span>${error.message}</span>
      </div>
    `
  }
})

// Nav scroll state
const nav = document.querySelector('#nav')
window.addEventListener(
  'scroll',
  () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 20)
  },
  { passive: true },
)

// Reveal on view
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in')
        io.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.15 },
)
document.querySelectorAll('.reveal').forEach((el) => io.observe(el))

// Fix map size after layout
setTimeout(() => map.invalidateSize(), 200)
window.addEventListener('resize', () => map.invalidateSize())

// Auto-run a gentle default preview route (low pressure) so map isn't empty
try {
  drawResult(simulateRoute({ from: 'pampulha', to: 'centro', time: '10:30' }))
} catch {
  // ignore
}
