import { corridors } from './corridors.js'
import { fetchDrivingRouteVia, fetchDrivingRoutes, geocodeOne } from './geo.js'

const VIA_POINTS = [
  { name: 'Anel / Carlos Luz', lat: -19.905, lng: -43.98 },
  { name: 'Av. do Contorno', lat: -19.924, lng: -43.94 },
  { name: 'Av. Amazonas', lat: -19.94, lng: -43.96 },
]

const PEAK_MORNING = { start: 7, end: 9 }
const PEAK_EVENING = { start: 17, end: 19 }
const SHOULDER = [
  { start: 6, end: 7 },
  { start: 9, end: 11 },
  { start: 16, end: 17 },
  { start: 19, end: 20 },
]

export const quickPlaces = [
  { label: 'UFMG / Pampulha', query: 'Universidade Federal de Minas Gerais, Belo Horizonte' },
  { label: 'Praça Sete', query: 'Praça Sete de Setembro, Belo Horizonte' },
  { label: 'Savassi', query: 'Praça da Liberdade, Belo Horizonte' },
  { label: 'Mercado Central', query: 'Mercado Central, Belo Horizonte' },
  { label: 'Barreiro', query: 'Barreiro, Belo Horizonte' },
  { label: 'Venda Nova', query: 'Venda Nova, Belo Horizonte' },
]

function parseHour(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return h + (m || 0) / 60
}

function congestionLevel(hour, peakFactor = 1) {
  const inPeak =
    (hour >= PEAK_MORNING.start && hour < PEAK_MORNING.end) ||
    (hour >= PEAK_EVENING.start && hour < PEAK_EVENING.end)
  const inShoulder = SHOULDER.some((w) => hour >= w.start && hour < w.end)

  if (inPeak) {
    return {
      key: 'high',
      label: 'Lentidão alta',
      title: 'Gargalo crítico detectado',
      score: Math.round(88 * peakFactor),
      delayFactor: 1.55,
    }
  }
  if (inShoulder) {
    return {
      key: 'medium',
      label: 'Fluxo moderado',
      title: 'Atenção no corredor',
      score: Math.round(55 * peakFactor),
      delayFactor: 1.25,
    }
  }
  return {
    key: 'low',
    label: 'Fluxo estável',
    title: 'Condições favoráveis',
    score: Math.round(22 * peakFactor),
    delayFactor: 1,
  }
}

function findIdealWindow(hour) {
  const candidates = [6.25, 9.25, 10.5, 14.0, 15.5, 20.0, 21.0]
  let best = candidates[0]
  let bestDiff = Infinity
  for (const c of candidates) {
    const diff = Math.abs(c - hour)
    if (diff < bestDiff && congestionLevel(c).key === 'low') {
      best = c
      bestDiff = diff
    }
  }
  const h = Math.floor(best)
  const m = Math.round((best - h) * 60)
  return {
    label: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
    flowGainPct: hour >= 7 && hour < 9 ? 45 : hour >= 17 && hour < 19 ? 48 : 30,
  }
}

function estimateCo2Kg(minutesSaved) {
  return Number((minutesSaved * 0.045).toFixed(2))
}

function distanceMeters(a, b) {
  const toRad = (d) => (d * Math.PI) / 180
  const R = 6371000
  const dLat = toRad(b[0] - a[0])
  const dLng = toRad(b[1] - a[1])
  const lat1 = toRad(a[0])
  const lat2 = toRad(b[0])
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

function detectCorridor(path) {
  let best = { name: 'Vias urbanas de BH', peakFactor: 0.9, score: Infinity }
  const samples = path.filter((_, i) => i % Math.max(1, Math.floor(path.length / 24)) === 0)

  for (const corridor of Object.values(corridors)) {
    let min = Infinity
    for (const sample of samples) {
      for (const point of corridor.path) {
        min = Math.min(min, distanceMeters(sample, point))
      }
    }
    if (min < best.score) {
      best = { name: corridor.name, peakFactor: corridor.peakFactor, score: min }
    }
  }

  if (best.score > 900) {
    return { name: 'Vias urbanas de BH', peakFactor: 0.9 }
  }
  return { name: best.name, peakFactor: best.peakFactor }
}

function buildTips(level, corridorName) {
  if (level.key === 'high') {
    return [
      `Evite o eixo ${corridorName} neste horário, se possível.`,
      'Considere a rota alternativa ou saída após as 09h15.',
      'O para-e-anda eleva emissões e tempo de viagem.',
    ]
  }
  if (level.key === 'medium') {
    return [
      'Há retenção moderada: mantenha margem de tempo.',
      'A rota alternativa pode reduzir paradas.',
      'Monitore o corredor antes de sair.',
    ]
  }
  return [
    'Janela favorável para deslocamento.',
    'Mantenha velocidade constante e evite acelerações bruscas.',
    'Bom momento para testar alternativas sustentáveis.',
  ]
}

async function resolvePoint(value) {
  if (value && typeof value === 'object' && value.lat && value.lng) {
    return {
      label: value.label,
      lat: value.lat,
      lng: value.lng,
    }
  }
  if (typeof value === 'string' && value.trim()) {
    return geocodeOne(value.trim())
  }
  throw new Error('Informe origem e destino válidos')
}

/**
 * Simula rota real entre dois pontos (endereço ou coordenada).
 * @param {{ from: string|{label,lat,lng}, to: string|{label,lat,lng}, time: string }} input
 */
export async function simulateRoute({ from, to, time }) {
  const origin = await resolvePoint(from)
  const destination = await resolvePoint(to)

  const samePoint =
    Math.abs(origin.lat - destination.lat) < 0.0003 &&
    Math.abs(origin.lng - destination.lng) < 0.0003
  if (samePoint) {
    throw new Error('Escolha origem e destino diferentes')
  }

  const routes = await fetchDrivingRoutes(origin, destination)
  const primary = routes[0]
  let alternative = routes[1] || null

  // Se o OSRM não devolver alternativa, força um desvio “por fora” via Anel/Contorno.
  if (!alternative) {
    let bestVia = null
    for (const via of VIA_POINTS) {
      try {
        const candidate = await fetchDrivingRouteVia(origin, via, destination)
        const similar =
          Math.abs(candidate.distanceKm - primary.distanceKm) < 0.4 &&
          Math.abs(candidate.durationMin - primary.durationMin) < 2
        if (similar) continue
        if (!bestVia || candidate.durationMin < bestVia.route.durationMin) {
          bestVia = { route: candidate, name: via.name }
        }
      } catch {
        // tenta próximo via
      }
    }
    if (bestVia) {
      alternative = {
        ...bestVia.route,
        viaName: bestVia.name,
      }
    }
  }

  const corridor = detectCorridor(primary.path)
  const hour = parseHour(time)
  const level = congestionLevel(hour, corridor.peakFactor)
  const ideal = findIdealWindow(hour)

  const primaryMinutes = Math.max(1, Math.round(primary.durationMin * level.delayFactor))
  let altMinutes
  let timeGainMin
  let altPath
  let altName
  let altDistanceKm
  let hasRealGeometry = false

  if (alternative) {
    // Alternativa sofre menos o pico (desvio de corredor crítico).
    const altDelay = Math.max(1, level.delayFactor - 0.4)
    altMinutes = Math.max(1, Math.round(alternative.durationMin * altDelay))
    // Se ainda não ganha no relógio, aplica alívio típico de evitar o gargalo no pico.
    if (altMinutes >= primaryMinutes && level.key !== 'low') {
      const relief = level.key === 'high' ? 0.24 : 0.15
      timeGainMin = Math.max(3, Math.round(primaryMinutes * relief))
      altMinutes = Math.max(1, primaryMinutes - timeGainMin)
    } else {
      timeGainMin = primaryMinutes - altMinutes
    }
    altPath = alternative.path
    altName = alternative.viaName
      ? `Desvio via ${alternative.viaName}`
      : 'Rota alternativa pelas vias secundárias'
    altDistanceKm = alternative.distanceKm
    hasRealGeometry = true
  } else {
    const ratio = level.key === 'high' ? 0.22 : level.key === 'medium' ? 0.14 : 0.08
    timeGainMin = Math.max(2, Math.round(primaryMinutes * ratio))
    altMinutes = Math.max(primaryMinutes - timeGainMin, Math.round(primaryMinutes * 0.7))
    altPath = primary.path
    altName = 'Mesmo eixo com saída em janela mais livre'
    altDistanceKm = primary.distanceKm
    hasRealGeometry = false
  }

  return {
    origin,
    destination,
    time,
    hour,
    corridor,
    level,
    primaryPath: primary.path,
    primary: {
      minutes: primaryMinutes,
      distanceKm: primary.distanceKm,
      freeFlowMin: primary.durationMin,
    },
    alternative: {
      name: altName,
      path: altPath,
      minutes: altMinutes,
      distanceKm: altDistanceKm,
      timeGainMin,
      co2Kg: estimateCo2Kg(timeGainMin),
      hasRealGeometry,
    },
    ideal,
    tips: buildTips(level, corridor.name),
  }
}
