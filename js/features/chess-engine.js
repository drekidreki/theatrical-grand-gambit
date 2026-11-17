/**
 * js/features/chess-engine.js
 * ===========================
 * Mesin aturan catur. Memvalidasi langkah; tidak menyentuh DOM sama sekali.
 *
 * Dokumen konsep bagian 9 meminta rules engine dipisah dari renderer papan.
 * Modul ini adalah rules engine-nya; tampilannya ada di chessboard.js.
 *
 * DUA JALUR
 *   1. Bila chess.js berhasil dimuat dari CDN (window.Chess), modul ini
 *      membungkusnya.
 *   2. Bila gagal, modul memakai validator internal di bawah yang menangani
 *      seluruh aturan yang diajarkan di Babak II: gerak enam bidak, rokade,
 *      en passant, promosi, skak, skakmat, pat, aturan 50 langkah, dan
 *      pengulangan tiga kali.
 *
 * Keduanya mengekspor antarmuka yang sama, sehingga papan catur tidak pernah
 * mati hanya karena satu CDN tidak dapat dijangkau.
 *
 * NOTASI
 * Langkah ditulis dalam notasi Indonesia (R Raja, M Menteri, B Benteng,
 * G Gajah, K Kuda, pion tanpa huruf) karena materi babak ini berbahasa
 * Indonesia. Perhatikan bahwa K di sini berarti Kuda, bukan King.
 */

/* ===========================================================================
   Konstanta bersama
   ======================================================================== */

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

/** Huruf notasi Indonesia per jenis bidak. Pion sengaja kosong. */
export const SAN_ID = { k: 'R', q: 'M', r: 'B', b: 'G', n: 'K', p: '' };

export const PIECE_NAME_ID = {
  k: 'Raja', q: 'Menteri', r: 'Benteng', b: 'Gajah', n: 'Kuda', p: 'Pion',
};

/** Nilai tukar standar, sesuai materi Babak II. */
export const PIECE_VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9, k: null };

const FILES = 'abcdefgh';

export const toSquare = (r, c) => `${FILES[c]}${8 - r}`;
export const fromSquare = (sq) => ({
  r: 8 - Number(sq[1]),
  c: FILES.indexOf(sq[0]),
});

const inside = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

/* ===========================================================================
   VALIDATOR INTERNAL
   Dipakai sebagai jalur cadangan bila chess.js tidak tersedia.
   ======================================================================== */

const KNIGHT_DELTAS = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const KING_DELTAS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const ROOK_DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const BISHOP_DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

class InternalChess {
  constructor(fen = START_FEN) {
    this.load(fen);
  }

  /* --- Pemuatan posisi -------------------------------------------------- */

  load(fen) {
    const [placement, turn, castling, ep, half, full] = fen.split(' ');

    this.squares = new Array(64).fill(null);

    let index = 0;
    for (const ch of placement) {
      if (ch === '/') continue;
      if (/\d/.test(ch)) {
        index += Number(ch);
      } else {
        this.squares[index] = {
          type: ch.toLowerCase(),
          color: ch === ch.toUpperCase() ? 'w' : 'b',
        };
        index += 1;
      }
    }

    this._turn = turn === 'b' ? 'b' : 'w';
    this.castling = {
      wK: castling.includes('K'),
      wQ: castling.includes('Q'),
      bK: castling.includes('k'),
      bQ: castling.includes('q'),
    };
    this.ep = ep && ep !== '-' ? fromSquare(ep) : null;
    this.halfmove = Number(half) || 0;
    this.fullmove = Number(full) || 1;
    this.history = [];
    this.positionCounts = new Map();
    this._countPosition();
  }

  reset() {
    this.load(START_FEN);
  }

  at(r, c) {
    return inside(r, c) ? this.squares[r * 8 + c] : null;
  }

  set(r, c, piece) {
    this.squares[r * 8 + c] = piece;
  }

  turn() {
    return this._turn;
  }

  /** Papan sebagai matriks 8x8, baris pertama adalah rank 8. */
  board() {
    const rows = [];
    for (let r = 0; r < 8; r += 1) {
      rows.push(this.squares.slice(r * 8, r * 8 + 8));
    }
    return rows;
  }

  /* --- Serialisasi ------------------------------------------------------- */

  fen() {
    let placement = '';

    for (let r = 0; r < 8; r += 1) {
      let gap = 0;
      for (let c = 0; c < 8; c += 1) {
        const piece = this.at(r, c);
        if (!piece) {
          gap += 1;
          continue;
        }
        if (gap) {
          placement += gap;
          gap = 0;
        }
        placement += piece.color === 'w' ? piece.type.toUpperCase() : piece.type;
      }
      if (gap) placement += gap;
      if (r < 7) placement += '/';
    }

    const rights =
      (this.castling.wK ? 'K' : '') +
      (this.castling.wQ ? 'Q' : '') +
      (this.castling.bK ? 'k' : '') +
      (this.castling.bQ ? 'q' : '');

    const epText = this.ep ? toSquare(this.ep.r, this.ep.c) : '-';

    return `${placement} ${this._turn} ${rights || '-'} ${epText} ${this.halfmove} ${this.fullmove}`;
  }

  /** Kunci posisi untuk deteksi pengulangan tiga kali (tanpa penghitung langkah). */
  _positionKey() {
    return this.fen().split(' ').slice(0, 4).join(' ');
  }

  _countPosition() {
    const key = this._positionKey();
    this.positionCounts.set(key, (this.positionCounts.get(key) ?? 0) + 1);
  }

  /* --- Serangan dan skak -------------------------------------------------- */

  findKing(color) {
    for (let i = 0; i < 64; i += 1) {
      const piece = this.squares[i];
      if (piece && piece.type === 'k' && piece.color === color) {
        return { r: Math.floor(i / 8), c: i % 8 };
      }
    }
    return null;
  }

  /** Apakah petak (r,c) diserang oleh pihak `by`. */
  isAttacked(r, c, by) {
    // Pion: menyerang secara diagonal satu petak ke arah majunya.
    const pawnDir = by === 'w' ? 1 : -1; // dari sudut pandang petak target
    for (const dc of [-1, 1]) {
      const piece = this.at(r + pawnDir, c + dc);
      if (piece && piece.color === by && piece.type === 'p') return true;
    }

    for (const [dr, dc] of KNIGHT_DELTAS) {
      const piece = this.at(r + dr, c + dc);
      if (piece && piece.color === by && piece.type === 'n') return true;
    }

    for (const [dr, dc] of KING_DELTAS) {
      const piece = this.at(r + dr, c + dc);
      if (piece && piece.color === by && piece.type === 'k') return true;
    }

    const slide = (dirs, types) => {
      for (const [dr, dc] of dirs) {
        let rr = r + dr;
        let cc = c + dc;
        while (inside(rr, cc)) {
          const piece = this.at(rr, cc);
          if (piece) {
            if (piece.color === by && types.includes(piece.type)) return true;
            break;
          }
          rr += dr;
          cc += dc;
        }
      }
      return false;
    };

    if (slide(ROOK_DIRS, ['r', 'q'])) return true;
    if (slide(BISHOP_DIRS, ['b', 'q'])) return true;

    return false;
  }

  inCheck(color = this._turn) {
    const king = this.findKing(color);
    if (!king) return false;
    return this.isAttacked(king.r, king.c, color === 'w' ? 'b' : 'w');
  }

  /* --- Pembangkitan langkah ------------------------------------------------ */

  /** Langkah pseudo-legal (belum menyaring keamanan Raja). */
  _pseudoMoves(color) {
    const moves = [];

    for (let r = 0; r < 8; r += 1) {
      for (let c = 0; c < 8; c += 1) {
        const piece = this.at(r, c);
        if (!piece || piece.color !== color) continue;

        const add = (tr, tc, extra = {}) => {
          if (!inside(tr, tc)) return;
          const target = this.at(tr, tc);
          if (target && target.color === color) return;
          moves.push({
            from: toSquare(r, c),
            to: toSquare(tr, tc),
            piece: piece.type,
            color,
            captured: target ? target.type : null,
            ...extra,
          });
        };

        const slide = (dirs) => {
          for (const [dr, dc] of dirs) {
            let tr = r + dr;
            let tc = c + dc;
            while (inside(tr, tc)) {
              const target = this.at(tr, tc);
              if (target && target.color === color) break;
              add(tr, tc);
              if (target) break;
              tr += dr;
              tc += dc;
            }
          }
        };

        switch (piece.type) {
          case 'p': {
            const dir = color === 'w' ? -1 : 1;
            const startRow = color === 'w' ? 6 : 1;
            const promoRow = color === 'w' ? 0 : 7;

            // Maju satu petak: hanya bila kosong.
            if (!this.at(r + dir, c)) {
              if (r + dir === promoRow) {
                for (const promo of ['q', 'r', 'b', 'n']) {
                  add(r + dir, c, { promotion: promo });
                }
              } else {
                add(r + dir, c);

                // Maju dua petak: hanya dari baris awal dan jalur kosong.
                if (r === startRow && !this.at(r + 2 * dir, c)) {
                  add(r + 2 * dir, c, { doublePush: true });
                }
              }
            }

            // Memakan secara diagonal.
            for (const dc of [-1, 1]) {
              const tr = r + dir;
              const tc = c + dc;
              if (!inside(tr, tc)) continue;

              const target = this.at(tr, tc);
              if (target && target.color !== color) {
                if (tr === promoRow) {
                  for (const promo of ['q', 'r', 'b', 'n']) {
                    add(tr, tc, { promotion: promo });
                  }
                } else {
                  add(tr, tc);
                }
              } else if (!target && this.ep && this.ep.r === tr && this.ep.c === tc) {
                // En passant: pion lawan dimakan seolah hanya maju satu petak.
                moves.push({
                  from: toSquare(r, c),
                  to: toSquare(tr, tc),
                  piece: 'p',
                  color,
                  captured: 'p',
                  enPassant: true,
                });
              }
            }
            break;
          }

          case 'n':
            for (const [dr, dc] of KNIGHT_DELTAS) add(r + dr, c + dc);
            break;

          case 'b':
            slide(BISHOP_DIRS);
            break;

          case 'r':
            slide(ROOK_DIRS);
            break;

          case 'q':
            slide([...ROOK_DIRS, ...BISHOP_DIRS]);
            break;

          case 'k': {
            for (const [dr, dc] of KING_DELTAS) add(r + dr, c + dc);

            // Rokade. Syarat selengkapnya diperiksa di bawah.
            const row = color === 'w' ? 7 : 0;
            const enemy = color === 'w' ? 'b' : 'w';

            if (r === row && c === 4 && !this.isAttacked(row, 4, enemy)) {
              const canK = color === 'w' ? this.castling.wK : this.castling.bK;
              const canQ = color === 'w' ? this.castling.wQ : this.castling.bQ;

              // Rokade pendek (0-0)
              if (
                canK &&
                !this.at(row, 5) && !this.at(row, 6) &&
                !this.isAttacked(row, 5, enemy) && !this.isAttacked(row, 6, enemy)
              ) {
                moves.push({
                  from: toSquare(row, 4), to: toSquare(row, 6),
                  piece: 'k', color, captured: null, castle: 'k',
                });
              }

              // Rokade panjang (0-0-0)
              if (
                canQ &&
                !this.at(row, 3) && !this.at(row, 2) && !this.at(row, 1) &&
                !this.isAttacked(row, 3, enemy) && !this.isAttacked(row, 2, enemy)
              ) {
                moves.push({
                  from: toSquare(row, 4), to: toSquare(row, 2),
                  piece: 'k', color, captured: null, castle: 'q',
                });
              }
            }
            break;
          }

          default:
            break;
        }
      }
    }

    return moves;
  }

  /**
   * Langkah legal. Setiap langkah pseudo-legal dicoba, lalu dibatalkan, untuk
   * memastikan Raja sendiri tidak tertinggal dalam posisi skak.
   */
  moves({ square = null, verbose = false } = {}) {
    const legal = [];

    for (const move of this._pseudoMoves(this._turn)) {
      if (square && move.from !== square) continue;

      const undo = this._apply(move);
      const safe = !this.inCheck(move.color);
      this._revert(undo);

      if (safe) legal.push(move);
    }

    if (!verbose) return legal.map((move) => this._san(move));

    // Lengkapi setiap langkah dengan notasinya.
    return legal.map((move) => ({ ...move, san: this._san(move) }));
  }

  /* --- Menjalankan dan membatalkan langkah ---------------------------------- */

  /** Menerapkan langkah tanpa validasi. Mengembalikan data untuk membatalkannya. */
  _apply(move) {
    const from = fromSquare(move.from);
    const to = fromSquare(move.to);
    const piece = this.at(from.r, from.c);

    const undo = {
      move,
      piece,
      captured: this.at(to.r, to.c),
      capturedAt: null,
      castling: { ...this.castling },
      ep: this.ep,
      halfmove: this.halfmove,
      fullmove: this.fullmove,
      turn: this._turn,
    };

    this.set(from.r, from.c, null);

    if (move.enPassant) {
      // Pion yang dimakan berada di belakang petak tujuan.
      const capturedRow = move.color === 'w' ? to.r + 1 : to.r - 1;
      undo.captured = this.at(capturedRow, to.c);
      undo.capturedAt = { r: capturedRow, c: to.c };
      this.set(capturedRow, to.c, null);
    }

    this.set(to.r, to.c, move.promotion ? { type: move.promotion, color: move.color } : piece);

    // Benteng ikut berpindah pada rokade.
    if (move.castle) {
      const row = from.r;
      if (move.castle === 'k') {
        undo.rook = { fromC: 7, toC: 5 };
        this.set(row, 5, this.at(row, 7));
        this.set(row, 7, null);
      } else {
        undo.rook = { fromC: 0, toC: 3 };
        this.set(row, 3, this.at(row, 0));
        this.set(row, 0, null);
      }
    }

    // Hak rokade hangus begitu Raja atau Benteng bersangkutan bergerak.
    if (piece.type === 'k') {
      if (move.color === 'w') { this.castling.wK = false; this.castling.wQ = false; }
      else { this.castling.bK = false; this.castling.bQ = false; }
    }
    if (piece.type === 'r') {
      if (from.r === 7 && from.c === 0) this.castling.wQ = false;
      if (from.r === 7 && from.c === 7) this.castling.wK = false;
      if (from.r === 0 && from.c === 0) this.castling.bQ = false;
      if (from.r === 0 && from.c === 7) this.castling.bK = false;
    }
    // Begitu pula bila Benteng lawan dimakan di petak asalnya.
    if (to.r === 7 && to.c === 0) this.castling.wQ = false;
    if (to.r === 7 && to.c === 7) this.castling.wK = false;
    if (to.r === 0 && to.c === 0) this.castling.bQ = false;
    if (to.r === 0 && to.c === 7) this.castling.bK = false;

    // Hak en passant hanya berlaku pada giliran tepat setelah langkah ganda.
    this.ep = move.doublePush
      ? { r: (from.r + to.r) / 2, c: from.c }
      : null;

    // Aturan 50 langkah: penghitung direset oleh gerak pion atau tangkapan.
    this.halfmove = piece.type === 'p' || undo.captured ? 0 : this.halfmove + 1;
    if (this._turn === 'b') this.fullmove += 1;
    this._turn = this._turn === 'w' ? 'b' : 'w';

    return undo;
  }

  _revert(undo) {
    const from = fromSquare(undo.move.from);
    const to = fromSquare(undo.move.to);

    this.set(from.r, from.c, undo.piece);
    this.set(to.r, to.c, null);

    if (undo.capturedAt) {
      this.set(undo.capturedAt.r, undo.capturedAt.c, undo.captured);
    } else if (undo.captured) {
      this.set(to.r, to.c, undo.captured);
    }

    if (undo.rook) {
      this.set(from.r, undo.rook.fromC, this.at(from.r, undo.rook.toC));
      this.set(from.r, undo.rook.toC, null);
    }

    this.castling = undo.castling;
    this.ep = undo.ep;
    this.halfmove = undo.halfmove;
    this.fullmove = undo.fullmove;
    this._turn = undo.turn;
  }

  /**
   * Menjalankan langkah bila legal.
   * @returns {Object|null} Objek langkah, atau null bila langkah tidak sah.
   */
  move({ from, to, promotion = 'q' }) {
    const candidates = this.moves({ square: from, verbose: true });
    const chosen =
      candidates.find((m) => m.to === to && (!m.promotion || m.promotion === promotion)) ??
      null;

    if (!chosen) return null;

    const undo = this._apply(chosen);
    this.history.push(undo);
    this._countPosition();

    // Lengkapi notasi dengan tanda skak atau skakmat.
    chosen.san = this._san(chosen, { afterMove: true });
    return chosen;
  }

  undo() {
    const undo = this.history.pop();
    if (!undo) return null;

    const key = this._positionKey();
    const count = this.positionCounts.get(key) ?? 1;
    if (count <= 1) this.positionCounts.delete(key);
    else this.positionCounts.set(key, count - 1);

    this._revert(undo);
    return undo.move;
  }

  /* --- Keadaan permainan ----------------------------------------------------- */

  isCheckmate() {
    return this.inCheck() && this.moves().length === 0;
  }

  isStalemate() {
    return !this.inCheck() && this.moves().length === 0;
  }

  /** Materi tidak cukup, sesuai empat skenario pada materi Babak II. */
  isInsufficientMaterial() {
    const pieces = this.squares.filter(Boolean);
    const nonKings = pieces.filter((p) => p.type !== 'k');

    if (nonKings.length === 0) return true; // Raja vs Raja
    if (nonKings.length === 1 && ['b', 'n'].includes(nonKings[0].type)) return true;

    // Raja + Gajah vs Raja + Gajah dengan Gajah pada warna petak yang sama.
    if (nonKings.length === 2 && nonKings.every((p) => p.type === 'b')) {
      const colors = [];
      for (let i = 0; i < 64; i += 1) {
        const piece = this.squares[i];
        if (piece && piece.type === 'b') {
          colors.push((Math.floor(i / 8) + (i % 8)) % 2);
        }
      }
      if (colors.length === 2 && colors[0] === colors[1]) return true;
    }

    return false;
  }

  isFiftyMoveRule() {
    return this.halfmove >= 100; // 50 langkah penuh dari kedua pemain
  }

  isThreefoldRepetition() {
    return [...this.positionCounts.values()].some((count) => count >= 3);
  }

  isDraw() {
    return (
      this.isStalemate() ||
      this.isInsufficientMaterial() ||
      this.isFiftyMoveRule() ||
      this.isThreefoldRepetition()
    );
  }

  isGameOver() {
    return this.isCheckmate() || this.isDraw();
  }

  /* --- Notasi Indonesia -------------------------------------------------------- */

  _san(move, { afterMove = false } = {}) {
    if (move.castle) {
      const base = move.castle === 'k' ? '0-0' : '0-0-0';
      return base + this._suffix(move, afterMove);
    }

    const letter = SAN_ID[move.piece];
    let text = letter;

    // Pembeda bila dua bidak sejenis dapat mencapai petak yang sama.
    if (move.piece !== 'p' && move.piece !== 'k') {
      const rivals = this._pseudoMoves(move.color).filter(
        (m) => m.piece === move.piece && m.to === move.to && m.from !== move.from
      );
      if (rivals.length > 0) {
        const sameFile = rivals.some((m) => m.from[0] === move.from[0]);
        text += sameFile ? move.from[1] : move.from[0];
      }
    }

    if (move.captured) {
      if (move.piece === 'p') text += move.from[0];
      text += 'x';
    }

    text += move.to;

    if (move.promotion) text += `=${SAN_ID[move.promotion]}`;
    if (move.enPassant) text += ' e.p.';

    return text + this._suffix(move, afterMove);
  }

  /** Tanda skak atau skakmat. Hanya akurat setelah langkah dijalankan. */
  _suffix(move, afterMove) {
    if (!afterMove) return '';
    if (this.isCheckmate()) return '#';
    if (this.inCheck()) return '+';
    return '';
  }
}

/* ===========================================================================
   PEMBUNGKUS chess.js
   Menyamakan antarmuka chess.js 0.10.x dengan validator internal, termasuk
   penulisan notasi Indonesia, sehingga tampilannya identik pada kedua jalur.
   ======================================================================== */

class ChessJsAdapter {
  constructor(fen = START_FEN) {
    /* eslint-disable-next-line new-cap */
    this.inner = new window.Chess(fen);
    this.history = [];
  }

  load(fen) { this.inner.load(fen); this.history = []; }
  reset() { this.inner.reset(); this.history = []; }
  turn() { return this.inner.turn(); }
  board() { return this.inner.board(); }
  fen() { return this.inner.fen(); }
  inCheck() { return this.inner.in_check(); }
  isCheckmate() { return this.inner.in_checkmate(); }
  isStalemate() { return this.inner.in_stalemate(); }
  isInsufficientMaterial() { return this.inner.insufficient_material(); }
  isThreefoldRepetition() { return this.inner.in_threefold_repetition(); }
  isFiftyMoveRule() { return Number(this.inner.fen().split(' ')[4]) >= 100; }
  isDraw() { return this.inner.in_draw() || this.inner.in_stalemate(); }
  isGameOver() { return this.inner.game_over(); }

  findKing(color) {
    const rows = this.inner.board();
    for (let r = 0; r < 8; r += 1) {
      for (let c = 0; c < 8; c += 1) {
        const piece = rows[r][c];
        if (piece && piece.type === 'k' && piece.color === color) return { r, c };
      }
    }
    return null;
  }

  moves({ square = null, verbose = false } = {}) {
    const raw = this.inner.moves(square ? { square, verbose: true } : { verbose: true });

    const mapped = raw.map((m) => ({
      from: m.from,
      to: m.to,
      piece: m.piece,
      color: m.color,
      captured: m.captured ?? null,
      promotion: m.promotion ?? null,
      castle: m.flags.includes('k') ? 'k' : m.flags.includes('q') ? 'q' : null,
      enPassant: m.flags.includes('e'),
      san: this._toIndonesian(m),
    }));

    return verbose ? mapped : mapped.map((m) => m.san);
  }

  move({ from, to, promotion = 'q' }) {
    const result = this.inner.move({ from, to, promotion });
    if (!result) return null;

    this.history.push(result);

    const mapped = {
      from: result.from,
      to: result.to,
      piece: result.piece,
      color: result.color,
      captured: result.captured ?? null,
      promotion: result.promotion ?? null,
      castle: result.flags.includes('k') ? 'k' : result.flags.includes('q') ? 'q' : null,
      enPassant: result.flags.includes('e'),
      san: '',
    };

    mapped.san = this._toIndonesian(result, true);
    return mapped;
  }

  undo() {
    this.history.pop();
    return this.inner.undo();
  }

  /**
   * Menerjemahkan SAN bahasa Inggris dari chess.js ke notasi Indonesia.
   * Huruf bidak di awal diganti; sisa notasi (petak, x, =, +, #) dipertahankan.
   */
  _toIndonesian(move, afterMove = false) {
    if (move.flags.includes('k')) return `0-0${this._suffix(afterMove)}`;
    if (move.flags.includes('q')) return `0-0-0${this._suffix(afterMove)}`;

    let text = SAN_ID[move.piece];

    // Pembeda dari SAN asli chess.js, mis. "Nbd2" -> ambil "b".
    const english = move.san.replace(/[+#]/g, '');
    if (move.piece !== 'p') {
      const body = english.slice(1).replace('x', '').replace(move.to, '');
      text += body;
    } else if (move.captured) {
      text += move.from[0];
    }

    if (move.captured) text += 'x';
    text += move.to;
    if (move.promotion) text += `=${SAN_ID[move.promotion]}`;
    if (move.flags.includes('e')) text += ' e.p.';

    return text + this._suffix(afterMove);
  }

  _suffix(afterMove) {
    if (!afterMove) return '';
    if (this.inner.in_checkmate()) return '#';
    if (this.inner.in_check()) return '+';
    return '';
  }
}

/* ===========================================================================
   Pabrik
   ======================================================================== */

/** Jalur mana yang sedang dipakai. Ditampilkan di antarmuka sebagai catatan. */
export function engineBackend() {
  return window.TGG_LIBS?.chess && typeof window.Chess === 'function'
    ? 'chess.js'
    : 'validator internal';
}

/**
 * Membuat instance mesin catur. Memakai chess.js bila tersedia, dan jatuh ke
 * validator internal bila tidak — tanpa perlu diketahui pemanggilnya.
 *
 * @param {string} [fen]
 */
export function createEngine(fen = START_FEN) {
  if (window.TGG_LIBS?.chess && typeof window.Chess === 'function') {
    try {
      return new ChessJsAdapter(fen);
    } catch (error) {
      console.warn('[TGG] chess.js gagal diinisialisasi, beralih ke validator internal.', error);
    }
  }
  return new InternalChess(fen);
}

export { InternalChess };
export default { createEngine, engineBackend, START_FEN, SAN_ID, PIECE_NAME_ID, PIECE_VALUE };
