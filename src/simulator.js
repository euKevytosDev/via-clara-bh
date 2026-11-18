import { corridors, places, routeCatalog } from './corridors.js'

const PEAK_MORNING = { start: 7, end: 9 }
const PEAK_EVENING = { start: 17, end: 19 }
const SHOULDER = [
  { start: 6, end: 7 },
  { start: 9, end: 11 },
  { start: 16, end: 17 },
  { start: 19, end: 20 },
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
      baseMinutes: Math.round(42 * peakFactor),
      co2Factor: 1.35,
    }
  }
  if (inShoulder) {
    return {
      key: 'medium',
      label: 'Fluxo moderado',
      title: 'Atenção no corredor',
      score: Math.round(55 * peakFactor),
      baseMinutes: Math.round(28 * peakFactor),
      co2Factor: 1.12,
    }
  }
  return {
    key: 'low',
    label: 'Fluxo estável',
    title: 'Condições favoráveis',
    score: Math.round(22 * peakFactor),
    baseMinutes: Math.round(18 * peakFactor),
    co2Factor: 1,
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
  // Estimativa didática: ~0.21 kg CO₂/km em congestionamento extra vs fluxo livre,
  // convertendo minutos economizados em ~0.35 km equivalentes por minuto parado/andando.
  return Number((minutesSaved * 0.045).toFixed(2))
}

export function getPlace(id) {
  return places.find((p) => p.id === id)
}

export function simulateRoute({ from, to, time }) {
  const origin = getPlace(from)
  const destination = getPlace(to)
  if (!origin || !destination) {
    throw new Error('Origem ou destino inválidos')
  }
  if (from === to) {
    throw new Error('Escolha origem e destino diferentes')
  }

  const match =
    routeCatalog.find((r) => r.from === from && r.to === to) ||
    routeCatalog.find((r) => r.from === to && r.to === from)

  const hour = parseHour(time)
  const primaryId = match?.primary || 'contorno'
  const corridor = corridors[primaryId]
  const level = congestionLevel(hour, corridor.peakFactor)
  const ideal = findIdealWindow(hour)

  const alt = match?.alternative || {
    name: 'Vias secundárias + Anel Rodoviário',
    path: [corridor.path[0], [-19.905, -43.98], corridor.path[corridor.path.length - 1]],
    timeGainMin: level.key === 'high' ? 14 : level.key === 'medium' ? 8 : 3,
    flowGainPct: level.key === 'high' ? 45 : 25,
  }

  const timeSaved = level.key === 'low' ? Math.max(3, Math.round(alt.timeGainMin * 0.35)) : alt.timeGainMin
  const altMinutes = Math.max(12, level.baseMinutes - timeSaved)
  const co2 = estimateCo2Kg(timeSaved)

  return {
    origin,
    destination,
    time,
    hour,
    corridor,
    level,
    primaryPath: corridor.path,
    alternative: {
      ...alt,
      minutes: altMinutes,
      timeGainMin: timeSaved,
      co2Kg: co2,
    },
    ideal,
    tips: buildTips(level, corridor.name),
  }
}

function buildTips(level, corridorName) {
  if (level.key === 'high') {
    return [
      `Evite ${corridorName} neste horário, se possível.`,
      'Considere transporte coletivo ou saída após as 09h15.',
      'O para-e-anda eleva emissões e tempo de viagem.',
    ]
  }
  if (level.key === 'medium') {
    return [
      'Há retenção moderada: mantenha margem de tempo.',
      'Rotas secundárias podem reduzir paradas.',
      'Monitore o corredor antes de sair.',
    ]
  }
  return [
    'Janela favorável para deslocamento.',
    'Mantenha velocidade constante e evite acelerações bruscas.',
    'Bom momento para testar alternativas sustentáveis.',
  ]
}

export { places, corridors }
