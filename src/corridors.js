/** Corredores críticos de Belo Horizonte (coordenadas aproximadas para demo). */

export const places = [
  { id: 'pampulha', label: 'Pampulha / UFMG', lat: -19.8688, lng: -43.958 },
  { id: 'centro', label: 'Centro / Praça Sete', lat: -19.9191, lng: -43.9386 },
  { id: 'savassi', label: 'Savassi', lat: -19.937, lng: -43.9345 },
  { id: 'barreiro', label: 'Barreiro', lat: -19.9772, lng: -44.015 },
  { id: 'venda-nova', label: 'Venda Nova', lat: -19.8155, lng: -43.954 },
  { id: 'aeroporto', label: 'Aeroporto Confins (sentido BH)', lat: -19.851, lng: -43.95 },
  { id: 'contorno-oeste', label: 'Anel / Carlos Luz', lat: -19.905, lng: -43.98 },
]

export const corridors = {
  'antonio-carlos': {
    id: 'antonio-carlos',
    name: 'Av. Antônio Carlos',
    path: [
      [-19.8688, -43.958],
      [-19.88, -43.96],
      [-19.892, -43.952],
      [-19.905, -43.945],
      [-19.9191, -43.9386],
    ],
    peakFactor: 1,
  },
  'cristiano-machado': {
    id: 'cristiano-machado',
    name: 'Av. Cristiano Machado',
    path: [
      [-19.8155, -43.954],
      [-19.84, -43.945],
      [-19.87, -43.935],
      [-19.9, -43.93],
      [-19.9191, -43.9386],
    ],
    peakFactor: 0.95,
  },
  amazonas: {
    id: 'amazonas',
    name: 'Av. Amazonas',
    path: [
      [-19.9772, -44.015],
      [-19.96, -43.99],
      [-19.945, -43.965],
      [-19.93, -43.945],
      [-19.9191, -43.9386],
    ],
    peakFactor: 0.9,
  },
  contorno: {
    id: 'contorno',
    name: 'Av. do Contorno',
    path: [
      [-19.93, -43.95],
      [-19.925, -43.94],
      [-19.92, -43.935],
      [-19.916, -43.932],
      [-19.9191, -43.9386],
    ],
    peakFactor: 0.85,
  },
  'afonso-pena': {
    id: 'afonso-pena',
    name: 'Av. Afonso Pena',
    path: [
      [-19.937, -43.9345],
      [-19.93, -43.936],
      [-19.925, -43.937],
      [-19.9191, -43.9386],
    ],
    peakFactor: 0.8,
  },
  'tereza-cristina': {
    id: 'tereza-cristina',
    name: 'Av. Tereza Cristina',
    path: [
      [-19.95, -43.98],
      [-19.94, -43.965],
      [-19.93, -43.95],
      [-19.92, -43.94],
    ],
    peakFactor: 0.88,
  },
}

/** Rotas simuladas: origem → destino → corredor principal + alternativa */
export const routeCatalog = [
  {
    from: 'pampulha',
    to: 'centro',
    primary: 'antonio-carlos',
    alternative: {
      name: 'Av. Pres. Carlos Luz / Anel Rodoviário',
      corridorId: null,
      path: [
        [-19.8688, -43.958],
        [-19.875, -43.975],
        [-19.905, -43.98],
        [-19.915, -43.96],
        [-19.9191, -43.9386],
      ],
      timeGainMin: 14,
      flowGainPct: 45,
    },
  },
  {
    from: 'venda-nova',
    to: 'centro',
    primary: 'cristiano-machado',
    alternative: {
      name: 'Via Anel Rodoviário + Contorno',
      corridorId: 'contorno',
      path: [
        [-19.8155, -43.954],
        [-19.83, -43.97],
        [-19.88, -43.985],
        [-19.91, -43.96],
        [-19.9191, -43.9386],
      ],
      timeGainMin: 12,
      flowGainPct: 38,
    },
  },
  {
    from: 'barreiro',
    to: 'centro',
    primary: 'amazonas',
    alternative: {
      name: 'Via Olinto Meireles + Contorno',
      corridorId: 'contorno',
      path: [
        [-19.9772, -44.015],
        [-19.96, -44.0],
        [-19.945, -43.98],
        [-19.93, -43.95],
        [-19.9191, -43.9386],
      ],
      timeGainMin: 11,
      flowGainPct: 36,
    },
  },
  {
    from: 'savassi',
    to: 'centro',
    primary: 'afonso-pena',
    alternative: {
      name: 'Via Rua da Bahia / vias internas',
      corridorId: null,
      path: [
        [-19.937, -43.9345],
        [-19.932, -43.94],
        [-19.926, -43.942],
        [-19.9191, -43.9386],
      ],
      timeGainMin: 7,
      flowGainPct: 28,
    },
  },
  {
    from: 'pampulha',
    to: 'savassi',
    primary: 'antonio-carlos',
    alternative: {
      name: 'Carlos Luz + Contorno até Savassi',
      corridorId: null,
      path: [
        [-19.8688, -43.958],
        [-19.88, -43.975],
        [-19.91, -43.97],
        [-19.925, -43.95],
        [-19.937, -43.9345],
      ],
      timeGainMin: 16,
      flowGainPct: 42,
    },
  },
  {
    from: 'aeroporto',
    to: 'centro',
    primary: 'cristiano-machado',
    alternative: {
      name: 'Linha Verde / Cristiano Machado fora de pico',
      corridorId: 'cristiano-machado',
      path: [
        [-19.851, -43.95],
        [-19.86, -43.94],
        [-19.89, -43.932],
        [-19.91, -43.93],
        [-19.9191, -43.9386],
      ],
      timeGainMin: 10,
      flowGainPct: 33,
    },
  },
  {
    from: 'barreiro',
    to: 'savassi',
    primary: 'tereza-cristina',
    alternative: {
      name: 'Amazonas + Contorno',
      corridorId: 'amazonas',
      path: [
        [-19.9772, -44.015],
        [-19.955, -43.99],
        [-19.94, -43.96],
        [-19.937, -43.9345],
      ],
      timeGainMin: 13,
      flowGainPct: 40,
    },
  },
]

export const bhCenter = [-19.9167, -43.9345]
