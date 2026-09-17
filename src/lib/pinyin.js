// Tiện ích xử lý pinyin: bỏ dấu thanh, tách âm tiết, lấy số thanh điệu.

const TONE_MARKS = {
  ā: ['a', 1], á: ['a', 2], ǎ: ['a', 3], à: ['a', 4],
  ē: ['e', 1], é: ['e', 2], ě: ['e', 3], è: ['e', 4],
  ī: ['i', 1], í: ['i', 2], ǐ: ['i', 3], ì: ['i', 4],
  ō: ['o', 1], ó: ['o', 2], ǒ: ['o', 3], ò: ['o', 4],
  ū: ['u', 1], ú: ['u', 2], ǔ: ['u', 3], ù: ['u', 4],
  ǖ: ['ü', 1], ǘ: ['ü', 2], ǚ: ['ü', 3], ǜ: ['ü', 4],
};

// Một âm tiết pinyin: (thanh mẫu)? + nguyên âm(+dấu) + (ng|n|r)?
const SYLLABLE_RE = /(?:zh|ch|sh|[bpmfdtnlgkhjqxzcsryw])?[aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+(?:ng|n|r)?/g;

/** "shēntǐ" -> "shenti" */
export function stripTones(py) {
  let out = '';
  for (const ch of py.toLowerCase()) {
    out += TONE_MARKS[ch] ? TONE_MARKS[ch][0] : ch;
  }
  return out;
}

/** Chuẩn hoá chuỗi để so khớp: bỏ dấu, khoảng trắng, số thanh, gạch nối, dấu nháy; ü -> v */
export function normalizeQuery(s) {
  return stripTones(s)
    .replace(/[\s\-'’.,!?]/g, '')
    .replace(/[0-5]/g, '')
    .replace(/ü/g, 'v');
}

/** Sinh các biến thể để khớp: "nǚ" -> ["nv", "nu"] */
export function searchKeys(py) {
  const base = normalizeQuery(py);
  const alt = base.replace(/v/g, 'u');
  return base === alt ? [base] : [base, alt];
}

/** Tách pinyin thành từng âm tiết: "shēntǐ" -> ["shēn", "tǐ"] */
export function splitSyllables(py) {
  return py.toLowerCase().match(SYLLABLE_RE) ?? [];
}

/** Thanh điệu từng âm tiết: "shēntǐ" -> [1, 3]; thanh nhẹ = 5 */
export function toneNumbers(py) {
  return splitSyllables(py).map((syl) => {
    for (const ch of syl) if (TONE_MARKS[ch]) return TONE_MARKS[ch][1];
    return 5;
  });
}

export const TONE_NAMES = { 1: '平', 2: '升', 3: '曲', 4: '降', 5: '轻' };
