// Mapa de valores para el algoritmo de dígito verificador (RENAPO)
const CHAR_VALUE: Record<string, number> = {
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4,
  '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17,
  I: 18, J: 19, K: 20, L: 21, M: 22, N: 23, Ñ: 24, O: 25,
  P: 26, Q: 27, R: 28, S: 29, T: 30, U: 31, V: 32, W: 33,
  X: 34, Y: 35, Z: 36,
}

const ESTADOS =
  'AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE'

const CURP_REGEX = new RegExp(
  `^[A-Z][AEIOU][A-Z]{2}\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])[HM](${ESTADOS})[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]\\d$`,
)

function calcularDigitoVerificador(curp17: string): number {
  let suma = 0
  for (let i = 0; i < 17; i++) {
    const val = CHAR_VALUE[curp17[i]]
    if (val === undefined) return -1
    suma += val * (18 - i)
  }
  return (10 - (suma % 10)) % 10
}

export function validarCURP(curp: string): { valida: boolean; error?: string } {
  const normalizada = curp.trim().toUpperCase()

  if (!CURP_REGEX.test(normalizada)) {
    return { valida: false, error: 'Formato de CURP inválido' }
  }

  const digitoEsperado = calcularDigitoVerificador(normalizada.slice(0, 17))
  const digitoReal = parseInt(normalizada[17], 10)

  if (digitoEsperado !== digitoReal) {
    return { valida: false, error: 'Dígito verificador de CURP incorrecto' }
  }

  return { valida: true }
}
