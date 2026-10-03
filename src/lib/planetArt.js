export function hash(n) {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

const FACE_KEYS = ['front', 'back', 'left', 'right', 'top', 'bottom'];

export function prepare(spec) {
  const faces = {};
  const fill = spec.fill ?? FACE_KEYS.map((key) => spec[key]?.[0]?.[0]).find(Boolean);
  for (const key of FACE_KEYS) {
    const rows = spec[key] || [fill];
    const count = {};
    for (const row of rows) for (const ch of row) count[ch] = (count[ch] || 0) + 1;
    const base = Object.keys(count).sort((a, b) => count[b] - count[a])[0];
    const groups = {};
    rows.forEach((row, j) => {
      [...row].forEach((ch, i) => {
        if (ch !== base) (groups[ch] ||= []).push(i, j);
      });
    });
    faces[key] = { rows, base, groups, wide: rows[0].length, tall: rows.length };
  }
  return { palette: spec.palette, faces };
}

function speckle(w, h, base, mix, seed) {
  const rows = [];
  for (let j = 0; j < h; j += 1) {
    let row = '';
    for (let i = 0; i < w; i += 1) {
      const r = hash(seed * 7.13 + i * 17.31 + j * 31.77 + i * j * 0.37);
      let ch = base;
      let acc = 0;
      for (const [c, p] of mix) {
        acc += p;
        if (r < acc) {
          ch = c;
          break;
        }
      }
      row += ch;
    }
    rows.push(row);
  }
  return rows;
}

const around = (rows) => ({ front: rows, back: rows, left: rows, right: rows });
const variants = (n, make) => Array.from({ length: n }, (_, i) => make(i + 1));
const solidCache = new Map();
export function solid(hex) {
  if (!solidCache.has(hex)) solidCache.set(hex, prepare({ palette: { a: hex }, fill: 'a' }));
  return solidCache.get(hex);
}

const HERO_PAL = {
  H: '#3f2516', h: '#52321f', S: '#f0bf94', s: '#d9a27a', W: '#ffffff', E: '#2f5fb3',
  P: '#f19a8c', M: '#a8483f', T: '#2f6fd6', t: '#5a94ee', Y: '#ffd23f', B: '#6b4423',
  D: '#2b3550', d: '#3b4a74', O: '#5a3a22', o: '#7a5234', R: '#c8323c', r: '#8e222c', G: '#ffd23f',
};
const mirror = (rows) => rows.map((row) => [...row].reverse().join(''));
const HEAD_SIDE = ['HHHHHHHH', 'HHHHHhHH', 'HHHHHHSS', 'HHHHSSSS', 'HHHSsSSS', 'HHHSSSSS', 'HHHSSSSS', 'HHSSSSSS'];
const BODY_SIDE = ['TTTT', 'TTTT', 'TTTT', 'TTTT', 'TTTT', 'TTTT', 'BBBB', 'TTTT'];
const ARM = ['TTTT', 'TTTT', 'tttt', 'SSSS', 'SSSS', 'SSSS', 'SSSS', 'ssss'];
const LEG = ['DDDD', 'DDDD', 'DdDD', 'DDDD', 'DDDD', 'oooo', 'OOOO', 'OOOO'];
const hero = (spec) => prepare({ palette: HERO_PAL, ...spec });

export const HERO = {
  head: hero({
    front: ['HHHHHHHH', 'HHhHHHHH', 'HSSSSSSH', 'SSSSSSSS', 'SWESSEWS', 'SPSSSSPS', 'SSMSSMSS', 'SSSMMSSS'],
    back: ['HHHHHHHH', 'HHHhHHHH', 'HhHHHHhH', 'HHHHHHHH', 'HHHHHhHH', 'HHhHHHHH', 'HHHHHHHH', 'HHHHHHHH'],
    right: HEAD_SIDE,
    left: mirror(HEAD_SIDE),
    top: ['HHHHHHHH', 'HhHHHHhH', 'HHHHHHHH', 'HHHhHHHH', 'HHHHHHHH', 'HhHHHHHH', 'HHHHHhHH', 'HHHHHHHH'],
    fill: 'S',
  }),
  body: hero({
    front: ['TTTttTTT', 'TTTTTTTT', 'TTTYYTTT', 'TTYYYYTT', 'TTTYYTTT', 'TTTTTTTT', 'BBBYYBBB', 'TTTTTTTT'],
    back: ['TTTTTTTT', 'TTTTTTTT', 'TTTTTTTT', 'TTTTTTTT', 'TTTTTTTT', 'TTTTTTTT', 'BBBBBBBB', 'TTTTTTTT'],
    right: BODY_SIDE,
    left: BODY_SIDE,
    fill: 'T',
  }),
  arm: hero({ ...around(ARM), top: ['T'], bottom: ['S'] }),
  leg: hero({ ...around(LEG), top: ['D'], bottom: ['O'] }),
  cape: hero({
    back: ['GRRRRRRG', 'RRRRRRRR', 'RRRrRRRR', 'RRRRRRRR', 'RRRRRRRR', 'RRRRRrRR', 'RRRRRRRR', 'RrRRRRRR', 'RRRRRRRR', 'GGGGGGGG'],
    top: ['G'],
    fill: 'r',
  }),
};

const DIRT = { d: '#8a5a34', e: '#74492a', f: '#a06e42' };
const STONE = { a: '#8e95a3', b: '#747b89', c: '#a9afbb' };
const dirtRows = (seed) => speckle(6, 6, 'd', [['e', 0.26], ['f', 0.16]], seed);
const stoneRows = (seed) => speckle(6, 6, 'a', [['b', 0.26], ['c', 0.18]], seed);

function grassSide(seed) {
  const rows = dirtRows(seed + 9);
  rows[0] = [...'gggggg'].map((_, i) => (hash(seed + i * 3.3) < 0.3 ? 'h' : 'g')).join('');
  rows[1] = [...rows[1]].map((ch, i) => (hash(seed + i * 5.1) < 0.45 ? 'g' : ch)).join('');
  return rows;
}

function snowSide(seed) {
  const rows = stoneRows(seed + 3);
  rows[0] = 'nnnnnn';
  rows[1] = [...rows[1]].map((ch, i) => (hash(seed + i * 4.7) < 0.55 ? 'n' : ch)).join('');
  return rows;
}

const GRASS_PAL = { a: '#62b63e', b: '#4f9c32', c: '#80cc52', ...DIRT, g: '#5aa83a', h: '#4c962f' };
const SAND_PAL = { s: '#e4c56e', t: '#d2ae58', u: '#f0dc96' };
const SNOW_PAL = { n: '#eef3f8', m: '#d3deeb', w: '#ffffff', ...STONE };
const WATER_PAL = { a: '#3c93d8', b: '#2f80c6', c: '#7cc0ef' };

const sandRows = (seed) => speckle(6, 6, 's', [['t', 0.24], ['u', 0.16]], seed);

export const TERRAIN = {
  grass: {
    top: variants(4, (s) => prepare({ palette: GRASS_PAL, top: speckle(6, 6, 'a', [['b', 0.22], ['c', 0.16]], s) })),
    side: variants(3, (s) => prepare({ palette: GRASS_PAL, ...around(grassSide(s)) })),
    under: variants(2, (s) => prepare({ palette: DIRT, ...around(dirtRows(s + 40)) })),
  },
  sand: {
    top: variants(4, (s) => prepare({ palette: SAND_PAL, top: sandRows(s + 10) })),
    side: variants(2, (s) => prepare({ palette: SAND_PAL, ...around(sandRows(s + 20)) })),
    under: variants(2, (s) => prepare({ palette: SAND_PAL, ...around(sandRows(s + 30)) })),
  },
  stone: {
    top: variants(4, (s) => prepare({ palette: STONE, top: stoneRows(s + 50) })),
    side: variants(2, (s) => prepare({ palette: STONE, ...around(stoneRows(s + 60)) })),
    under: variants(2, (s) => prepare({ palette: STONE, ...around(stoneRows(s + 70)) })),
  },
  snow: {
    top: variants(4, (s) => prepare({ palette: SNOW_PAL, top: speckle(6, 6, 'n', [['m', 0.22], ['w', 0.14]], s + 80) })),
    side: variants(2, (s) => prepare({ palette: SNOW_PAL, ...around(snowSide(s)) })),
    under: variants(2, (s) => prepare({ palette: STONE, ...around(stoneRows(s + 90)) })),
  },
  water: {
    top: variants(4, (s) => prepare({ palette: WATER_PAL, top: speckle(6, 6, 'a', [['b', 0.24], ['c', 0.1]], s + 100) })),
    side: [prepare({ palette: WATER_PAL, ...around(['bbbbbb']) })],
    under: [prepare({ palette: WATER_PAL, ...around(['bbbbbb']) })],
  },
};

export const PATH_TEX = prepare({
  palette: { K: '#a39d90', h: '#bdb7a9', z: '#756e61' },
  top: ['KKzKKK', 'hKzKhK', 'zzzzzz', 'KKKKzK', 'KhKKzK', 'zzzzzz'],
});

const PLANKS = ['FFFFFF', 'FgFFFF', 'ffffff', 'FFFFgF', 'FFFFFF', 'ffffff'];
const BRICKS = ['SSStSS', 'SSSsSS', 'ssssss', 'StSSSS', 'SsSSSS', 'ssssss'];
const GEM = ['OOOQOO', 'OOQOOO', 'OQOOOo', 'QOOOoO', 'OOOoOO', 'OOoOOO'];
const LEAF_ROWS = speckle(6, 6, 'L', [['m', 0.3], ['n', 0.16]], 7);
const PLANK_PAL = { F: '#d39a5a', f: '#93623a', g: '#b07a44' };

export const BLOCK_TEX = {
  wood: prepare({ palette: PLANK_PAL, ...around(PLANKS), top: PLANKS, bottom: PLANKS }),
  stone: prepare({ palette: { S: '#c9ccd4', s: '#8d93a0', t: '#e2e4e9' }, ...around(BRICKS), top: BRICKS, bottom: BRICKS }),
  gold: prepare({ palette: { O: '#ffd60a', Q: '#fff3a0', o: '#d9b000' }, ...around(GEM), top: GEM, bottom: GEM }),
  leaf: prepare({ palette: { L: '#46c46a', m: '#2f9a4e', n: '#6ad884' }, ...around(LEAF_ROWS), top: LEAF_ROWS, bottom: LEAF_ROWS }),
};

function log(palette) {
  return prepare({
    palette: { ...palette, Y: '#b98a52', y: '#8f6438' },
    ...around(['WWwW', 'WwWW', 'WWWw', 'wWWW', 'WWwW', 'WwWW']),
    top: ['YYYY', 'YyyY', 'YyyY', 'YYYY'],
    bottom: ['Y'],
  });
}

function leaves(palette, mix, seed) {
  return prepare({
    palette,
    ...around(speckle(6, 6, 'L', mix, seed)),
    top: speckle(6, 6, 'L', mix, seed + 1),
    bottom: speckle(6, 6, 'L', mix, seed + 2),
  });
}

const OAK_PAL = { L: '#2f8a3a', m: '#22702c', o: '#4aae52', R: '#e8473c' };
const TEX = {
  oakLog: log({ W: '#6b4423', w: '#4f3018' }),
  birchLog: prepare({
    palette: { V: '#ece7dc', v: '#2f2f33', Y: '#d8cdb4' },
    ...around(['VVVV', 'VvvV', 'VVVV', 'VVVv', 'vVVV', 'VVVV']),
    top: ['Y'],
    bottom: ['Y'],
  }),
  glowLog: log({ W: '#3a2552', w: '#2a1a3e' }),
  oakLeaf: leaves(OAK_PAL, [['m', 0.28], ['o', 0.16]], 11),
  appleLeaf: leaves(OAK_PAL, [['m', 0.26], ['o', 0.14], ['R', 0.07]], 21),
  pineLeaf: leaves({ L: '#1d5a3a', m: '#154a2f', o: '#2a7550' }, [['m', 0.3], ['o', 0.16]], 31),
  birchLeaf: leaves({ L: '#8cc63f', m: '#74ab30', o: '#a9dc5e' }, [['m', 0.26], ['o', 0.18]], 41),
  glowLeaf: leaves({ L: '#5a3fb8', m: '#432f96', C: '#7ff0e0' }, [['m', 0.28], ['C', 0.1]], 51),
  snowCap: prepare({ palette: SNOW_PAL, ...around(['nnnn', 'nmnn']), top: ['nnnn', 'nwnn', 'nnmn', 'nnnn'] }),
  bush: leaves({ L: '#2f8f48', m: '#23733a', R: '#ff4f7a', V: '#8a5cff' }, [['m', 0.26], ['R', 0.1], ['V', 0.05]], 61),
  rocks: [
    prepare({ palette: { ...STONE, g: '#5f9a46', Q: '#ffd23f' }, ...around(speckle(6, 6, 'a', [['b', 0.26], ['c', 0.14], ['Q', 0.05]], 71)), top: speckle(6, 6, 'a', [['g', 0.4], ['c', 0.16]], 72) }),
    prepare({ palette: { ...STONE, g: '#5f9a46', Q: '#7ec8ff' }, ...around(speckle(6, 6, 'a', [['b', 0.26], ['c', 0.14], ['Q', 0.05]], 73)), top: speckle(6, 6, 'a', [['b', 0.2], ['c', 0.2]], 74) }),
  ],
  crystal: prepare({
    palette: { Z: '#7ec8ff', z: '#4a8fd6', w: '#d7f4ff' },
    ...around(['ZwZZ', 'ZZwZ', 'zZZw', 'ZzZZ', 'ZZzZ', 'zZZZ']),
    top: ['wZ', 'Zw'],
  }),
  stone: prepare({ palette: STONE, ...around(stoneRows(77)), top: stoneRows(78) }),
  pillar: prepare({
    palette: { ...STONE, r: '#c6aaff' },
    ...around(['aaaa', 'abaa', 'aaaa', 'arra', 'raar', 'arra', 'aaba', 'aaaa', 'abaa', 'aaaa']),
    top: ['cccc', 'cacc', 'ccca', 'cccc'],
  }),
  lantern: prepare({
    palette: { k: '#2d2a3a', Y: '#ffe08a', y: '#ffc94a' },
    ...around(['kkkk', 'kYYk', 'kyYk', 'kkkk']),
    top: ['k'],
    bottom: ['k'],
  }),
  stemCap: {
    red: prepare({ palette: { R: '#d63a3a', W: '#fff4ec' }, ...around(['RRWR', 'RRRR']), top: ['RRRR', 'RWRR', 'RRRW', 'WRRR'] }),
    magic: prepare({ palette: { R: '#a07cff', W: '#e7dcff' }, ...around(['RRWR', 'RRRR']), top: ['RRRR', 'RWRR', 'RRRW', 'WRRR'] }),
  },
  tent: prepare({
    palette: { R: '#d9485f', W: '#f6e3c8' },
    ...around(['RRWWRRWW', 'RRWWRRWW']),
    top: ['RRWWRRWW', 'RRWWRRWW', 'RRWWRRWW', 'RRWWRRWW'],
  }),
  planks: prepare({ palette: PLANK_PAL, ...around(PLANKS), top: PLANKS }),
  lily: prepare({ palette: { L: '#2f8f45', l: '#5cbf62' }, ...around(['L']), top: ['LLLl', 'LlLL', 'LLLL', 'lLLL'] }),
  rabbit: prepare({ palette: { b: '#e8e2d8', c: '#d4ccbe' }, ...around(['bbbb', 'bcbb', 'bbbb']), top: ['bbbb', 'bbcb', 'bbbb'] }),
  rabbitHead: prepare({
    palette: { b: '#e8e2d8', k: '#2a1f24', p: '#f4a4b0' },
    front: ['bbbb', 'kbbk', 'bppb', 'bbbb'],
    left: ['bbbb', 'bkbb', 'bbbb'],
    right: ['bbbb', 'bbkb', 'bbbb'],
    fill: 'b',
  }),
};

export function blockTex(id) {
  return BLOCK_TEX[id] || BLOCK_TEX.stone;
}

const box = (x, y, z, w, h, d, tex) => ({ c: [x, y + h / 2, z], s: [w, h, d], tex });

export function treeModel(variant, s, seed) {
  if (variant === 'pine') {
    return [
      box(0, 0, 0, 0.24, 0.8 * s, 0.24, TEX.oakLog),
      box(0, 0.62 * s, 0, 1.25 * s, 0.32 * s, 1.25 * s, TEX.pineLeaf),
      box(0, 0.94 * s, 0, 0.98 * s, 0.32 * s, 0.98 * s, TEX.pineLeaf),
      box(0, 1.26 * s, 0, 0.7 * s, 0.32 * s, 0.7 * s, TEX.pineLeaf),
      box(0, 1.58 * s, 0, 0.42 * s, 0.3 * s, 0.42 * s, TEX.pineLeaf),
      box(0, 1.88 * s, 0, 0.2 * s, 0.14 * s, 0.2 * s, TEX.snowCap),
    ];
  }
  if (variant === 'birch') {
    return [
      box(0, 0, 0, 0.22, 1.4 * s, 0.22, TEX.birchLog),
      box(0, 1.15 * s, 0, 1.05 * s, 0.75 * s, 1.05 * s, TEX.birchLeaf),
      box(0, 1.9 * s, 0, 0.6 * s, 0.32 * s, 0.6 * s, TEX.birchLeaf),
    ];
  }
  if (variant === 'glow') {
    return [
      box(0, 0, 0, 0.28, 1.0 * s, 0.28, TEX.glowLog),
      box(0, 0.9 * s, 0, 1.3 * s, 0.8 * s, 1.3 * s, TEX.glowLeaf),
      box(0, 1.7 * s, 0, 0.72 * s, 0.38 * s, 0.72 * s, TEX.glowLeaf),
    ];
  }
  const leaf = hash(seed + 99) > 0.55 ? TEX.appleLeaf : TEX.oakLeaf;
  return [
    box(0, 0, 0, 0.28, 1.1 * s, 0.28, TEX.oakLog),
    box(0, 1.0 * s, 0, 1.35 * s, 0.85 * s, 1.35 * s, leaf),
    box(0, 1.85 * s, 0, 0.82 * s, 0.4 * s, 0.82 * s, leaf),
  ];
}

export function rockModel(seed) {
  const tex = TEX.rocks[Math.floor(hash(seed) * 2)];
  const ox = (hash(seed + 1) - 0.5) * 0.12;
  return [
    box(ox, 0, 0, 0.76, 0.48, 0.7, tex),
    box(ox + 0.12, 0.48, -0.06, 0.46, 0.32, 0.44, tex),
    box(ox - 0.34, 0, 0.3, 0.3, 0.22, 0.3, tex),
  ];
}

export function crystalModel() {
  return [
    box(0, 0, 0, 0.7, 0.18, 0.7, TEX.stone),
    box(0, 0.18, 0, 0.22, 1.0, 0.22, TEX.crystal),
    box(-0.2, 0.18, 0.12, 0.14, 0.62, 0.14, TEX.crystal),
    box(0.2, 0.18, -0.1, 0.14, 0.72, 0.14, TEX.crystal),
    box(0.08, 0.18, 0.24, 0.1, 0.42, 0.1, TEX.crystal),
  ];
}

export function bushModel() {
  return [
    box(0, 0, 0, 0.74, 0.5, 0.74, TEX.bush),
    box(0.05, 0.5, -0.04, 0.42, 0.22, 0.42, TEX.bush),
  ];
}

export function stumpModel() {
  return [box(0, 0, 0, 0.32, 0.24, 0.32, TEX.oakLog)];
}

const FLOWER_COLORS = ['#ff6b8a', '#ffd60a', '#ffffff', '#d7b4ff'];
export function flowerModel(seed) {
  const parts = [];
  for (let i = 0; i < 2; i += 1) {
    const ox = 0.1 + hash(seed + i * 3) * 0.3 - (i ? 0.45 : 0);
    const oz = -0.25 + hash(seed + i * 7) * 0.5;
    const color = FLOWER_COLORS[Math.floor(hash(seed + i * 11) * FLOWER_COLORS.length)];
    parts.push(box(ox, 0, oz, 0.05, 0.2, 0.05, solid('#3f8f2e')));
    parts.push(box(ox, 0.2, oz, 0.14, 0.1, 0.14, solid(color)));
    parts.push(box(ox, 0.3, oz, 0.06, 0.03, 0.06, solid('#ffe14a')));
  }
  return parts;
}

export function mushroomModel(magic) {
  return [
    box(-0.15, 0, 0.12, 0.08, 0.14, 0.08, solid('#f4efe6')),
    box(-0.15, 0.14, 0.12, 0.26, 0.1, 0.26, magic ? TEX.stemCap.magic : TEX.stemCap.red),
    box(0.12, 0, -0.1, 0.05, 0.08, 0.05, solid('#f4efe6')),
    box(0.12, 0.08, -0.1, 0.14, 0.06, 0.14, magic ? TEX.stemCap.magic : TEX.stemCap.red),
  ];
}

export function bloomModel() {
  return [
    box(-0.08, 0, 0.08, 0.05, 0.18, 0.05, solid('#3f8f2e')),
    box(-0.08, 0.18, 0.08, 0.16, 0.16, 0.16, solid('#ffe14a')),
  ];
}

export function pillarModel() {
  return [
    box(0, 0, 0, 0.54, 0.14, 0.54, TEX.stone),
    box(0, 0.14, 0, 0.4, 1.1, 0.4, TEX.pillar),
    box(0, 1.24, 0, 0.54, 0.14, 0.54, TEX.stone),
  ];
}

export function lampModel(ox, oz) {
  return [
    box(ox, 0, oz, 0.08, 1.1, 0.08, solid('#2d2a3a')),
    box(ox, 1.1, oz, 0.24, 0.28, 0.24, TEX.lantern),
    box(ox, 1.38, oz, 0.3, 0.06, 0.3, solid('#2d2a3a')),
  ];
}

export function reedModel(seed, time) {
  const parts = [];
  for (let i = 0; i < 4; i += 1) {
    const ox = -0.3 + hash(seed + i * 3) * 0.6;
    const oz = -0.3 + hash(seed + i * 5) * 0.6;
    const tall = 0.45 + hash(seed + i) * 0.35;
    const lean = Math.sin(time * 1.6 + seed + i) * 0.03;
    parts.push(box(ox, 0, oz, 0.04, tall, 0.04, solid('#5f8f3a')));
    if (i % 2 === 0) parts.push(box(ox + lean, tall - 0.12, oz, 0.08, 0.16, 0.08, solid('#7a4a26')));
  }
  return parts;
}

export function lilyModel(seed, time) {
  const drift = Math.sin(time * 0.8 + seed) * 0.05;
  const ox = -0.15 + hash(seed) * 0.3 + drift;
  const oz = -0.15 + hash(seed + 1) * 0.3;
  const parts = [box(ox, 0, oz, 0.44, 0.03, 0.44, TEX.lily)];
  if (hash(seed + 5) > 0.45) {
    parts.push(box(ox, 0.03, oz, 0.14, 0.1, 0.14, solid('#ffb3d1')));
    parts.push(box(ox, 0.13, oz, 0.06, 0.03, 0.06, solid('#ffe66d')));
  }
  return parts;
}

export function pebbleModel(sand) {
  const tex = solid(sand ? '#c4a15a' : '#6e7582');
  return [box(0.2, 0, -0.15, 0.14, 0.07, 0.12, tex), box(0.3, 0, -0.02, 0.08, 0.05, 0.08, tex)];
}

export function fireModel(time) {
  const parts = [];
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    parts.push(box(Math.cos(a) * 0.34, 0, Math.sin(a) * 0.34, 0.14, 0.1, 0.14, i % 2 ? solid('#7d8494') : solid('#9aa1b0')));
  }
  parts.push(box(0, 0, 0, 0.5, 0.1, 0.12, TEX.oakLog));
  parts.push(box(0, 0.1, 0, 0.12, 0.1, 0.5, TEX.oakLog));
  const flick = (k) => 0.5 + Math.sin(time * 9 + k * 2.1) * 0.5;
  parts.push(box(0, 0.2, 0, 0.26, 0.16 + flick(0) * 0.08, 0.26, solid('#ff9f0a')));
  parts.push(box(0.02, 0.36, -0.02, 0.16, 0.12 + flick(1) * 0.1, 0.16, solid('#ffc21a')));
  parts.push(box(-0.01, 0.5 + flick(2) * 0.06, 0.01, 0.08, 0.08, 0.08, solid('#ffe14a')));
  return parts;
}

export function seatModel() {
  return [
    box(1.2, 0, 0.1, 0.6, 0.22, 0.22, TEX.oakLog),
    box(-0.25, 0, 0.75, 0.22, 0.22, 0.6, TEX.oakLog),
  ];
}

export function signModel() {
  return [
    box(0, 0, 0, 0.08, 0.6, 0.08, TEX.oakLog),
    box(0, 0.5, 0, 0.6, 0.34, 0.06, TEX.planks),
  ];
}

export function tentModel(time) {
  const wave = Math.sin(time * 4) * 0.04;
  return [
    box(0, 0, 0, 1.5, 0.3, 1.1, TEX.tent),
    box(0, 0.3, 0, 1.16, 0.3, 1.1, TEX.tent),
    box(0, 0.6, 0, 0.82, 0.3, 1.1, TEX.tent),
    box(0, 0.9, 0, 0.46, 0.26, 1.1, TEX.tent),
    box(0, 0, 0.54, 0.34, 0.56, 0.04, solid('#2a1420')),
    box(0, 1.16, 0, 0.05, 0.4, 0.05, TEX.oakLog),
    box(0.14, 1.4 + wave, 0, 0.24, 0.14, 0.03, solid('#ffd60a')),
  ];
}

export function rabbitModel(hop) {
  const y = hop > 0 ? 0.12 : 0;
  return [
    box(0, y, -0.04, 0.22, 0.18, 0.3, TEX.rabbit),
    box(0, y + 0.1, 0.16, 0.16, 0.16, 0.16, TEX.rabbitHead),
    box(-0.04, y + 0.26, 0.14, 0.04, 0.16, 0.04, solid('#f4a4b0')),
    box(0.04, y + 0.26, 0.14, 0.04, 0.16, 0.04, solid('#f4a4b0')),
    box(0, y + 0.06, -0.21, 0.08, 0.08, 0.06, solid('#ffffff')),
  ];
}
