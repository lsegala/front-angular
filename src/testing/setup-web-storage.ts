// Node 25+ define `globalThis.localStorage`/`sessionStorage` como getters que retornam `undefined`
// quando o processo não recebe `--localstorage-file`. O ambiente jsdom do Vitest só copia para o
// global as chaves que ainda não existem, então o Web Storage do jsdom fica de fora e qualquer
// `localStorage.clear()` nos testes quebra com "Cannot read properties of undefined".
// Aqui instalamos um Storage em memória só quando isso acontece. Em Node 20/22/24 não faz nada.

class MemoryStorage implements Storage {
  private readonly data = new Map<string, string>();

  get length(): number {
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.get(String(key)) ?? null;
  }

  key(index: number): string | null {
    return [...this.data.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.data.delete(String(key));
  }

  setItem(key: string, value: string): void {
    this.data.set(String(key), String(value));
  }
}

for (const key of ['localStorage', 'sessionStorage'] as const) {
  if ((globalThis as Record<string, unknown>)[key] === undefined) {
    Object.defineProperty(globalThis, key, {
      value: new MemoryStorage(),
      configurable: true,
      writable: true,
    });
  }
}
