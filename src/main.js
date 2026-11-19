import './style.css'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { bhCenter } from './corridors.js'
import { quickPlaces, simulateRoute } from './simulator.js'
import { searchAddresses } from './geo.js'
import { icons } from './icons.js'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const quickChips = quickPlaces
  .map(
    (place) =>
      `<button type="button" class="chip" data-query="${place.query.replace(/"/g, '&quot;')}">${place.label}</button>`,
  )
  .join('')

document.querySelector('#app').innerHTML = `
  <div class="page-bg" aria-hidden="true">
    <div class="page-bg__photo page-bg__photo--a"></div>
    <div class="page-bg__photo page-bg__photo--b"></div>
    <div class="page-bg__glow"></div>
  </div>

  <header class="nav" id="nav">
    <div class="container nav__inner">
      <a class="brand" href="#topo">ViaClara <span>BH</span> <small>Mobilidade e Cia</small></a>
      <nav class="nav__links" aria-label="Seções">
        <a href="#historia">História</a>
        <a href="#problema">Cenário</a>
        <a href="#beneficios">Benefícios</a>
        <a href="#curiosidades">Curiosidades</a>
        <a href="#simulador">Simulador</a>
        <a href="#ods">ODS 11</a>
      </nav>
      <a class="nav__cta" href="#simulador">Simular rota</a>
    </div>
  </header>

  <main id="topo">
    <section class="hero">
      <div class="hero__media" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=2200&q=80"
          alt=""
          width="2200"
          height="1467"
        />
        <div class="hero__veil"></div>
        <div class="hero__traffic-strip"></div>
      </div>
      <div class="container hero__content">
        <p class="eyebrow">Mobilidade urbana inteligente · Belo Horizonte</p>
        <h1>ViaClara <em>BH</em></h1>
        <p class="hero__lead">
          Plataforma da Mobilidade e Cia que traduz o congestionamento de Belo Horizonte
          em informação clara: corredores críticos, horários de pico, rotas alternativas
          e estimativa de impacto ambiental.
        </p>
        <div class="hero__actions">
          <a class="btn btn--primary" href="#simulador">Simular meu deslocamento</a>
          <a class="btn btn--ghost" href="#historia">Conhecer o contexto de BH</a>
        </div>
        <div class="hero__meta">
          <div><strong>6</strong> corredores estruturantes</div>
          <div><strong>ODS 11</strong> metas 11.6 e 11.7</div>
          <div><strong>Mapa ao vivo</strong> OpenStreetMap</div>
        </div>
      </div>
      <div class="hero__float-icons" aria-hidden="true">
        <span class="float-icon float-icon--1">${icons.car}</span>
        <span class="float-icon float-icon--2">${icons.bus}</span>
        <span class="float-icon float-icon--3">${icons.signal}</span>
      </div>
    </section>

    <section class="story" id="historia">
      <div class="container story__grid">
        <div class="story__copy reveal">
          <p class="eyebrow">Do plano pioneiro ao trânsito do século XXI</p>
          <h2>Belo Horizonte nasceu planejada — e cresceu além das vias</h2>
          <p>
            Projetada no final do século XIX como capital moderna de Minas Gerais,
            Belo Horizonte foi pensada com avenidas largas e um desenho geométrico inovador
            para a época. O Centro, organizado em torno de praças e eixos como Afonso Pena
            e Amazonas, concentrou comércio, serviços e fluxo de pessoas desde cedo.
          </p>
          <p>
            Com a expansão da Região Metropolitana, o automóvel ganhou protagonismo.
            Corredores que ligam Pampulha, Venda Nova, Barreiro e o Centro passaram a
            absorver deslocamentos diários intensos. Em horários de pico, avenidas como
            Antônio Carlos, Cristiano Machado, Contorno e Tereza Cristina operam no limite,
            elevando tempo de viagem, estresse e emissões.
          </p>
          <p>
            É nesse cenário que a Mobilidade e Cia propõe a ViaClara BH: tornar o trânsito
            legível para a população e apoiar escolhas de rota e horário com menor retenção.
          </p>
        </div>
        <aside class="story__aside reveal">
          <figure class="photo-card">
            <img
              src="https://images.unsplash.com/photo-1502481851512-e9e2529da23d?auto=format&fit=crop&w=1400&q=80"
              alt="Trânsito urbano intenso à noite"
              width="1400"
              height="933"
              loading="lazy"
            />
            <figcaption>Fluxo intenso em vias arteriais — referência visual do desafio urbano.</figcaption>
          </figure>
          <div class="icon-strip">
            <div class="icon-chip">${icons.city}<span>Centro histórico e eixos comerciais</span></div>
            <div class="icon-chip">${icons.car}<span>Alta dependência do modal individual</span></div>
            <div class="icon-chip">${icons.clock}<span>Picos matinais e vespertinos recorrentes</span></div>
          </div>
        </aside>
      </div>
    </section>

    <section class="problem" id="problema">
      <div class="container">
        <div class="section-head reveal">
          <h2>O centro e os corredores sob pressão</h2>
          <p>
            O problema não é apenas “trânsito parado”: é previsibilidade perdida, qualidade
            do ar comprometida e tempo que deixa de ser produtividade, lazer ou descanso.
          </p>
        </div>

        <div class="prose-panel reveal">
          <p>
            Nos deslocamentos casa–trabalho–estudo, milhares de veículos convergem para os
            mesmos eixos em janelas curtas. O resultado é o clássico para-e-anda: aceleração
            e frenagem constantes, maior consumo de combustível e aumento de poluentes locais.
            Para pedestres e usuários do transporte coletivo, a saturação também significa
            ônibus mais lentos e menor confiabilidade das linhas.
          </p>
          <p>
            A ViaClara BH organiza esse diagnóstico em linguagem acessível e permite testar,
            na prática, o efeito de mudar horário ou rota — sem depender de aplicativos pagos
            ou chaves de API comerciais.
          </p>
        </div>

        <div class="problem__grid">
          <article class="stat-card reveal">
            <div class="stat-card__icon">${icons.clock}</div>
            <strong>+40 min</strong>
            <span>atraso típico simulado em pico nos eixos principais</span>
          </article>
          <article class="stat-card reveal">
            <div class="stat-card__icon">${icons.signal}</div>
            <strong>07h–09h</strong>
            <span>janela crítica matinal com lentidão elevada</span>
          </article>
          <article class="stat-card reveal">
            <div class="stat-card__icon">${icons.leaf}</div>
            <strong>CO₂↑</strong>
            <span>retenção eleva emissões por quilômetro rodado</span>
          </article>
        </div>

        <div class="corridor-list reveal">
          <h3>Corredores monitorados na plataforma</h3>
          <div class="pill-row">
            <span class="pill">Av. Antônio Carlos</span>
            <span class="pill">Av. Cristiano Machado</span>
            <span class="pill">Av. Amazonas</span>
            <span class="pill">Av. do Contorno</span>
            <span class="pill">Av. Afonso Pena</span>
            <span class="pill">Av. Tereza Cristina</span>
          </div>
        </div>
      </div>
    </section>

    <section class="benefits" id="beneficios">
      <div class="container">
        <div class="section-head reveal">
          <h2>Benefícios da ViaClara BH</h2>
          <p>
            Mais do que uma página institucional, a plataforma entrega informação útil
            para quem se desloca e clareza para quem comunica mobilidade urbana.
          </p>
        </div>
        <div class="feature-grid">
          <article class="feature reveal">
            <div class="feature__icon">${icons.signal}</div>
            <h3>Leitura rápida do pico</h3>
            <p>Identifica gargalos conforme horário e corredor, com alertas compreensíveis.</p>
          </article>
          <article class="feature reveal">
            <div class="feature__icon">${icons.route}</div>
            <h3>Alternativas simuladas</h3>
            <p>Sugere trajetos secundários e estima economia de minutos no deslocamento.</p>
          </article>
          <article class="feature reveal">
            <div class="feature__icon">${icons.clock}</div>
            <h3>Janela ideal de saída</h3>
            <p>Indica horários próximos com menor retenção para planejar melhor o dia.</p>
          </article>
          <article class="feature reveal">
            <div class="feature__icon">${icons.leaf}</div>
            <h3>Consciência ambiental</h3>
            <p>Mostra estimativa de CO₂ evitado ao reduzir o para-e-anda — alinhado ao ODS 11.</p>
          </article>
          <article class="feature reveal">
            <div class="feature__icon">${icons.mapPin}</div>
            <h3>Mapa interativo gratuito</h3>
            <p>Visualiza BH com OpenStreetMap/Leaflet, sem chave paga de mapas comerciais.</p>
          </article>
          <article class="feature reveal">
            <div class="feature__icon">${icons.city}</div>
            <h3>Educação em mobilidade</h3>
            <p>Explica padrões urbanos e incentiva escolhas mais eficientes de deslocamento.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="curiosities" id="curiosidades">
      <div class="container curiosities__grid">
        <div class="section-head reveal">
          <h2>Curiosidades do trânsito em BH</h2>
          <p>Alguns fatos que ajudam a entender por que o mapeamento inteligente importa.</p>
        </div>
        <div class="curiosity-cards">
          <article class="curiosity reveal">
            <span class="curiosity__n">01</span>
            <h3>Capital planejada, metrópole viva</h3>
            <p>
              O traçado original privilegiava avenidas amplas, mas o crescimento metropolitano
              e a motorização ampliada transformaram esses eixos em artérias saturadas.
            </p>
          </article>
          <article class="curiosity reveal">
            <span class="curiosity__n">02</span>
            <h3>Pico tem “cara” de corredor</h3>
            <p>
              Antônio Carlos e Cristiano Machado concentram fluxo norte–centro; Amazonas e
              Tereza Cristina pesam no sentido Barreiro; Contorno e Afonso Pena tensionam o miolo urbano.
            </p>
          </article>
          <article class="curiosity reveal">
            <span class="curiosity__n">03</span>
            <h3>Minutos viram emissões</h3>
            <p>
              Em congestão, o veículo gasta mais energia para percorrer a mesma distância.
              Evitar retenção não é só conforto: é também qualidade do ar.
            </p>
          </article>
          <article class="curiosity reveal">
            <span class="curiosity__n">04</span>
            <h3>Mudar 30 minutos muda o jogo</h3>
            <p>
              Sair um pouco antes ou depois do pico pode reduzir drasticamente o tempo parado.
              O simulador torna essa diferença visível e fácil de demonstrar.
            </p>
          </article>
        </div>
        <figure class="photo-banner reveal">
          <img
            src="https://images.unsplash.com/photo-1544620341-609bcdbae563?auto=format&fit=crop&w=1800&q=80"
            alt="Ônibus e veículos em via urbana congestionada"
            width="1800"
            height="1200"
            loading="lazy"
          />
          <figcaption>Transporte coletivo e veículos individuais compartilham os mesmos gargalos urbanos.</figcaption>
        </figure>
      </div>
    </section>

    <section class="simulator" id="simulador">
      <div class="container">
        <div class="section-head reveal">
          <h2>Simulador inteligente de rotas</h2>
          <p>
            Digite ruas e endereços reais de Belo Horizonte. A ViaClara BH traça a rota
            no mapa, sugere alternativa, alerta o pico e estima economia de tempo e CO₂.
          </p>
        </div>

        <div class="sim-shell reveal">
          <form class="sim-form" id="sim-form">
            <h3>Planejar deslocamento</h3>
            <div class="field field--suggest">
              <label for="from">Origem (rua, número ou ponto)</label>
              <input
                id="from"
                name="from"
                type="text"
                autocomplete="off"
                placeholder="Ex.: Av. Afonso Pena, 1500"
                required
              />
              <div class="suggest" id="from-suggest" hidden></div>
            </div>
            <div class="field field--suggest">
              <label for="to">Destino (rua, número ou ponto)</label>
              <input
                id="to"
                name="to"
                type="text"
                autocomplete="off"
                placeholder="Ex.: Rua da Bahia, 1148"
                required
              />
              <div class="suggest" id="to-suggest" hidden></div>
            </div>
            <div class="field">
              <label for="time">Horário pretendido</label>
              <input id="time" name="time" type="time" value="07:30" required />
            </div>
            <div class="chip-row" id="quick-from" data-target="from">
              <span class="chip-row__label">Atalhos origem</span>
              ${quickChips}
            </div>
            <div class="chip-row" id="quick-to" data-target="to">
              <span class="chip-row__label">Atalhos destino</span>
              ${quickChips}
            </div>
            <button class="btn btn--primary" type="submit" id="sim-submit">Simular rota agora</button>
            <p class="form-hint">
              Dica: Av. Antônio Carlos, 6627 → Praça Sete de Setembro às 07:30.
            </p>
          </form>

          <div class="sim-map-wrap">
            <div class="map-note">Belo Horizonte · mapa interativo</div>
            <div id="map" role="region" aria-label="Mapa de Belo Horizonte"></div>
          </div>

          <div class="results" id="results" aria-live="polite"></div>
        </div>
      </div>
    </section>

    <section class="ods" id="ods">
      <div class="container">
        <div class="ods__panel reveal">
          <span class="ods__badge">Agenda 2030</span>
          <h3>ODS 11 — Cidades e Comunidades Sustentáveis</h3>
          <p>
            A ViaClara BH dialoga com a meta 11.6 (reduzir o impacto ambiental negativo
            per capita das cidades, inclusive quanto à qualidade do ar) e com a meta 11.7
            (ampliar o acesso a espaços públicos seguros, inclusivos e acessíveis), ao
            estimular deslocamentos mais eficientes e conscientes.
          </p>
          <div class="pill-row">
            <span class="pill">Meta 11.6 · qualidade do ar</span>
            <span class="pill">Meta 11.7 · cidade acessível</span>
            <span class="pill">Mobilidade inteligente</span>
            <span class="pill">Belo Horizonte</span>
          </div>
        </div>
      </div>
    </section>

    <section class="closing">
      <div class="container">
        <div class="closing__card reveal">
          <div class="closing__icons" aria-hidden="true">
            ${icons.bus}${icons.route}${icons.leaf}
          </div>
          <h2>Mobilidade e Cia · ViaClara BH</h2>
          <p>
            Uma plataforma educativa e interativa para compreender o congestionamento
            em Belo Horizonte, apoiar decisões de deslocamento e conectar mobilidade urbana
            às metas de sustentabilidade da Agenda 2030.
          </p>
          <div class="hero__actions">
            <a class="btn btn--primary" href="#simulador">Ir ao simulador</a>
            <a class="btn btn--ghost" href="#historia">Rever o contexto</a>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container footer__inner">
      <span>ViaClara BH · Mobilidade e Cia</span>
      <span>Cidades Inteligentes · Belo Horizonte</span>
    </div>
  </footer>
`

const selected = {
  from: null,
  to: null,
}

const fromInput = document.querySelector('#from')
const toInput = document.querySelector('#to')
const submitBtn = document.querySelector('#sim-submit')

fromInput.value = 'Av. Antônio Carlos, 6627'
toInput.value = 'Praça Sete de Setembro'

const map = L.map('map', {
  zoomControl: true,
  scrollWheelZoom: true,
  preferCanvas: true,
}).setView(bhCenter, 12)

const esri = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
  {
    attribution: 'Tiles &copy; Esri &mdash; fontes Esri, OpenStreetMap e demais',
    maxZoom: 19,
  },
)

const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap',
  maxZoom: 19,
})

esri.addTo(map)
esri.on('tileerror', () => {
  if (!map.hasLayer(osm)) {
    map.removeLayer(esri)
    osm.addTo(map)
  }
})

let primaryLayer = null
let altLayer = null
let primaryGlow = null
const markersLayer = L.layerGroup().addTo(map)

function clearRoutes() {
  ;[primaryGlow, primaryLayer, altLayer].forEach((layer) => {
    if (layer) map.removeLayer(layer)
  })
  primaryGlow = null
  primaryLayer = null
  altLayer = null
  markersLayer.clearLayers()
}

function drawResult(result) {
  clearRoutes()

  const primaryColor =
    result.level.key === 'high' ? '#e11d48' : result.level.key === 'medium' ? '#f5a623' : '#0d9488'

  primaryGlow = L.polyline(result.primaryPath, {
    color: primaryColor,
    weight: 12,
    opacity: 0.22,
    lineCap: 'round',
    lineJoin: 'round',
  }).addTo(map)

  primaryLayer = L.polyline(result.primaryPath, {
    color: primaryColor,
    weight: 6,
    opacity: 0.98,
    lineCap: 'round',
    lineJoin: 'round',
  }).addTo(map)

  if (result.alternative.hasRealGeometry) {
    altLayer = L.polyline(result.alternative.path, {
      color: '#0d9488',
      weight: 5,
      opacity: 0.95,
      dashArray: '10 8',
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map)
  }

  L.marker([result.origin.lat, result.origin.lng])
    .bindPopup(`<strong>Origem</strong><br>${result.origin.label}`)
    .addTo(markersLayer)
  L.marker([result.destination.lat, result.destination.lng])
    .bindPopup(`<strong>Destino</strong><br>${result.destination.label}`)
    .addTo(markersLayer)

  const allPoints = result.alternative.hasRealGeometry
    ? [...result.primaryPath, ...result.alternative.path]
    : result.primaryPath
  map.fitBounds(L.latLngBounds(allPoints).pad(0.2), { animate: true, duration: 0.75 })
  setTimeout(() => map.invalidateSize(), 50)

  const results = document.querySelector('#results')
  results.classList.add('is-visible')
  results.innerHTML = `
    <div class="alert alert--${result.level.key}">
      <strong>${result.level.title} (${result.level.label})</strong>
      <span>${result.corridor.name} · ${result.time} · ${result.primary.distanceKm} km · índice ${result.level.score}/100</span>
    </div>
    <div class="result-grid">
      <article class="result-card">
        <small>Rota principal</small>
        <strong>${result.primary.minutes} min</strong>
        <p>Fluxo livre ~${result.primary.freeFlowMin} min · com pico estimado ${result.primary.minutes} min</p>
      </article>
      <article class="result-card">
        <small>Rota alternativa</small>
        <strong>${result.alternative.name}</strong>
        <p>${result.alternative.minutes} min · ${
          result.alternative.timeGainMin >= 0
            ? `economia de ${result.alternative.timeGainMin} min`
            : `${Math.abs(result.alternative.timeGainMin)} min a mais`
        }${result.alternative.hasRealGeometry ? ' · traçado no mapa' : ''}</p>
      </article>
      <article class="result-card">
        <small>Janela ideal · ODS 11</small>
        <strong>${result.ideal.label} · −${result.alternative.co2Kg} kg CO₂</strong>
        <p>Fluxo pode reduzir cerca de ${result.ideal.flowGainPct}% vs. o horário simulado</p>
      </article>
    </div>
    <ul class="tips">
      ${result.tips.map((t) => `<li>${t}</li>`).join('')}
    </ul>
  `
}

function showError(message) {
  const results = document.querySelector('#results')
  results.classList.add('is-visible')
  results.innerHTML = `
    <div class="alert alert--high">
      <strong>Não foi possível simular</strong>
      <span>${message}</span>
    </div>
  `
}

function debounce(fn, wait = 380) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), wait)
  }
}

function bindAutocomplete(input, suggestEl, key) {
  let controller = null
  let requestId = 0
  let latestItems = []
  let lockedAfterSelect = false

  const closeSuggest = () => {
    suggestEl.hidden = true
    suggestEl.innerHTML = ''
  }

  const choose = (item) => {
    lockedAfterSelect = true
    controller?.abort()
    requestId += 1
    selected[key] = item
    input.value = item.label
    closeSuggest()
    input.blur()
  }

  // mousedown + preventDefault evita perder o clique (bug clássico de autocomplete)
  suggestEl.addEventListener('mousedown', (event) => {
    const btn = event.target.closest('.suggest__item')
    if (!btn) return
    event.preventDefault()
    event.stopPropagation()
    const item = latestItems[Number(btn.dataset.index)]
    if (item) choose(item)
  })

  const render = (items) => {
    if (lockedAfterSelect) return
    latestItems = items
    if (!items.length) {
      closeSuggest()
      return
    }
    suggestEl.hidden = false
    suggestEl.innerHTML = items
      .map(
        (item, index) => `
        <button type="button" class="suggest__item" data-index="${index}">
          <strong>${item.label}</strong>
          <span>${item.raw.split(',').slice(0, 4).join(',')}</span>
        </button>`,
      )
      .join('')
  }

  const runSearch = debounce(async () => {
    const q = input.value.trim()
    if (selected[key]?.label === q) {
      closeSuggest()
      return
    }

    selected[key] = null
    if (q.length < 3) {
      render([])
      return
    }

    controller?.abort()
    controller = new AbortController()
    const currentId = ++requestId

    try {
      const items = await searchAddresses(q, { signal: controller.signal })
      if (currentId !== requestId || lockedAfterSelect) return
      render(items)
    } catch (error) {
      if (error.name !== 'AbortError' && currentId === requestId) render([])
    }
  }, 320)

  input.addEventListener('input', () => {
    lockedAfterSelect = false
    runSearch()
  })

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeSuggest()
  })

  input.addEventListener('focus', () => {
    if (!lockedAfterSelect && latestItems.length && !selected[key]) {
      render(latestItems)
    }
  })

  document.addEventListener('mousedown', (event) => {
    if (event.target === input || suggestEl.contains(event.target)) return
    closeSuggest()
  })
}

bindAutocomplete(fromInput, document.querySelector('#from-suggest'), 'from')
bindAutocomplete(toInput, document.querySelector('#to-suggest'), 'to')

document.querySelectorAll('.chip-row').forEach((row) => {
  const target = row.dataset.target
  row.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const input = document.querySelector(`#${target}`)
      input.value = chip.dataset.query
      selected[target] = null
      input.focus()
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
  })
})

async function runSimulation() {
  const fromValue = selected.from || fromInput.value.trim()
  const toValue = selected.to || toInput.value.trim()
  const time = document.querySelector('#time').value

  submitBtn.disabled = true
  submitBtn.textContent = 'Calculando rota…'
  document.querySelector('#results').classList.add('is-visible')
  document.querySelector('#results').innerHTML = `
    <div class="alert alert--medium">
      <strong>Traçando rota nas vias de BH…</strong>
      <span>Buscando endereços e montando o caminho no mapa.</span>
    </div>
  `

  try {
    const result = await simulateRoute({ from: fromValue, to: toValue, time })
    selected.from = result.origin
    selected.to = result.destination
    fromInput.value = result.origin.label
    toInput.value = result.destination.label
    drawResult(result)
    document.querySelector('#results').scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  } catch (error) {
    showError(error.message || 'Erro inesperado ao simular')
  } finally {
    submitBtn.disabled = false
    submitBtn.textContent = 'Simular rota agora'
  }
}

document.querySelector('#sim-form').addEventListener('submit', (event) => {
  event.preventDefault()
  runSimulation()
})

const nav = document.querySelector('#nav')
window.addEventListener(
  'scroll',
  () => nav.classList.toggle('is-scrolled', window.scrollY > 20),
  { passive: true },
)

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in')
        io.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.12 },
)
document.querySelectorAll('.reveal').forEach((el) => io.observe(el))

const mapWrap = document.querySelector('.sim-map-wrap')
const mapIo = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        map.invalidateSize()
        setTimeout(() => map.invalidateSize(), 150)
      }
    })
  },
  { threshold: 0.2 },
)
mapIo.observe(mapWrap)

window.addEventListener('resize', () => map.invalidateSize())

requestAnimationFrame(() => {
  map.invalidateSize()
  runSimulation()
})
