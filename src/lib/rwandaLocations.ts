/**
 * Rwanda's administrative locations: District → Sector → Cell → Village (Umudugudu).
 * Source: the MIT-licensed `rwanda` package (30 districts, 416 sectors, 14,837 villages),
 * stored in src/data/rwanda-locations.json.
 *
 * The list is about 60 KB compressed, so it is downloaded only when the Quick Loan form
 * opens, never with the home page.
 */

type Tree = Record<string, Record<string, Record<string, string[]>>>;
export type LocationLevel = 'sector' | 'cell' | 'village';

let tree: Tree | null = null;
let status: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
let pending: Promise<void> | null = null;

export function loadRwandaLocations(): Promise<void> {
  if (tree) return Promise.resolve();
  if (!pending) {
    status = 'loading';
    pending = import('../data/rwanda-locations.json')
      .then((m) => {
        tree = m.default as Tree;
        status = 'ready';
      })
      .catch(() => {
        status = 'error';
        pending = null; // allow a retry next time the form opens
      });
  }
  return pending;
}

interface Chosen {
  district?: string;
  sector?: string;
  cell?: string;
}

/**
 * Options for a level, given what is already chosen above it.
 * Returns null if the list could not be downloaded (the field then accepts typing instead).
 */
export function locationOptions(level: LocationLevel, { district, sector, cell }: Chosen): string[] | null {
  if (status === 'error') return null;
  if (!tree || !district) return [];
  const sectors = tree[district] ?? {};
  if (level === 'sector') return Object.keys(sectors);
  if (!sector) return [];
  const cells = sectors[sector] ?? {};
  if (level === 'cell') return Object.keys(cells);
  if (!cell) return [];
  return cells[cell] ?? [];
}

export const locationsLoading = () => status === 'loading' || status === 'idle';
