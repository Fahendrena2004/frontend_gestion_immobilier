export const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

/** Simule une latence réseau réaliste pour les données de démonstration. */
export function mockResolve(data, delay = 350) {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay))
}
