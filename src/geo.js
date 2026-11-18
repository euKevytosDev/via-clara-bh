/** Geocoding (Nominatim) + roteamento real (OSRM) — gratuitos, sem API key. */

const BH_VIEWBOX = '-44.15,-19.75,-43.80,-20.05'
const NOMINATIM = 'https://nominatim.openstreetmap.org/search'
const OSRM = 'https://router.project-osrm.org/route/v1/driving'

const headers = {
  Accept: 'application/json',
}

function toLatLng(coords) {
  // GeoJSON: [lng, lat] → Leaflet: [lat, lng]
  return coords.map(([lng, lat]) => [lat, lng])
}

async function nominatimSearch(params, signal) {
  const res = await fetch(`${NOMINATIM}?${params}`, { headers, signal })
  if (!res.ok) throw new Error('Falha ao buscar endereços')
  return res.json()
}

export async function searchAddresses(query, { signal, limit = 6 } = {}) {
  const q = query.trim()
  if (q.length < 3) return []

  const base = {
    format: 'json',
    q: `${q}, Belo Horizonte, Minas Gerais, Brasil`,
    addressdetails: '1',
    limit: String(limit),
    countrycodes: 'br',
    viewbox: BH_VIEWBOX,
  }

  let data = await nominatimSearch(new URLSearchParams({ ...base, bounded: '1' }), signal)

  // Se a busca restrita falhar (número específico etc.), tenta na região sem trava rígida.
  if (!data.length) {
    data = await nominatimSearch(new URLSearchParams(base), signal)
  }

  return data.map((item) => ({
    label: formatNominatimLabel(item),
    lat: Number(item.lat),
    lng: Number(item.lon),
    raw: item.display_name,
  }))
}

function formatNominatimLabel(item) {
  const a = item.address || {}
  const street = [a.road, a.pedestrian, a.footway, a.square].find(Boolean)
  const number = a.house_number
  const suburb = a.suburb || a.neighbourhood || a.city_district
  const parts = []
  if (street && number) parts.push(`${street}, ${number}`)
  else if (street) parts.push(street)
  else if (item.name) parts.push(item.name)
  if (suburb) parts.push(suburb)
  if (!parts.length) return item.display_name.split(',').slice(0, 3).join(',')
  return parts.join(' · ')
}

export async function geocodeOne(query) {
  const results = await searchAddresses(query, { limit: 1 })
  if (!results.length) {
    throw new Error(`Endereço não encontrado em BH: "${query}"`)
  }
  return results[0]
}

async function requestOsrm(coordString) {
  const url = `${OSRM}/${coordString}?overview=full&geometries=geojson&alternatives=true&steps=false`
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error('Falha ao calcular a rota no mapa')
  const data = await res.json()

  if (data.code !== 'Ok' || !data.routes?.length) {
    throw new Error('Não foi possível traçar uma rota entre esses pontos')
  }

  return data.routes.map((route, index) => ({
    index,
    distanceKm: Number((route.distance / 1000).toFixed(1)),
    durationMin: Math.max(1, Math.round(route.duration / 60)),
    path: toLatLng(route.geometry.coordinates),
  }))
}

export async function fetchDrivingRoutes(origin, destination) {
  const direct = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`
  return requestOsrm(direct)
}

/** Rota “por fora” passando por um ponto intermediário (ex.: Anel Rodoviário). */
export async function fetchDrivingRouteVia(origin, via, destination) {
  const coords = `${origin.lng},${origin.lat};${via.lng},${via.lat};${destination.lng},${destination.lat}`
  const routes = await requestOsrm(coords)
  return routes[0]
}
