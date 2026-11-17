/**
 * js/features/chessboard.js
 * =========================
 * Renderer papan catur. Semua validasi langkah diserahkan ke chess-engine.js;
 * modul ini hanya mengurus tampilan dan interaksi.
 *
 * INTERAKSI
 * Memakai mekanisme tap-to-select lalu tap-to-move, bukan drag-and-drop.
 * Alasannya: di dalam <iframe> pada layar sentuh, gestur drag bertabrakan
 * dengan gestur scroll vertikal halaman. Ketuk-ketuk bekerja sama baiknya
 * dengan mouse, sentuhan, maupun keyboard.
 *
 * Papan memakai width: min(100%, 480px) dengan aspect-ratio 1/1, sehingga
 * petak tidak pernah gepeng bahkan pada layar 360 px.
 */

import { el, empty, $$ } from '../utils/helpers.js';
import { createEngine, toSquare, fromSquare, SAN_ID, PIECE_NAME_ID } from './chess-engine.js';
import { UNICODE } from '../utils/piece-art.js';

const FILES = 'abcdefgh';

export class Chessboard {
  /**
   * @param {Object} options
   * @param {string} [options.fen]          Posisi awal.
   * @param {boolean} [options.interactive] Izinkan memindahkan bidak.
   * @param {boolean} [options.showControls] Tampilkan Reset/Undo/Flip.
   * @param {boolean} [options.showHistory]  Tampilkan riwayat langkah.
   * @param {string}  [options.highlightFrom] Sorot langkah legal satu bidak.
   * @param {Function} [options.onMove]      Dipanggil setelah langkah sah.
   */
  constructor({
    fen,
    interactive = true,
    showControls = true,
    showHistory = true,
    highlightFrom = null,
    onMove = null,
  } = {}) {
    this.engine = createEngine(fen);
    this.startFen = fen ?? this.engine.fen();
    this.interactive = interactive;
    this.showControls = showControls;
    this.showHistory = showHistory;
    this.highlightFrom = highlightFrom;
    this.onMove = onMove;

    this.flipped = false;
    this.selected = null;
    this.legalTargets = [];
    this.lastMove = null;
    this.moveLog = [];

    this.root = el('div', { class: 'chessboard-wrap' });
    this.boardNode = el('div', {
      class: 'chessboard',
      role: 'grid',
      'aria-label': 'Papan catur interaktif',
    });

    this.statusNode = el('div', { class: 'board-status', role: 'status', 'aria-live': 'polite' });
    this.historyNode = el('div', { class: 'move-history' });

    this.root.append(this.boardNode);
    if (showControls) this.root.append(this._buildControls());
    this.root.append(this.statusNode);
    if (showHistory) this.root.append(this.historyNode);

    this.boardNode.addEventListener('click', (event) => this._onSquareClick(event));
    this.boardNode.addEventListener('keydown', (event) => this._onKeydown(event));

    this.render();
  }

  /** Elemen akar untuk disisipkan ke halaman. */
  get element() {
    return this.root;
  }

  /* --- Kontrol ------------------------------------------------------------ */

  _buildControls() {
    return el('div', { class: 'board-controls' }, [
      el('button', {
        class: 'btn btn--ghost btn--sm',
        type: 'button',
        text: 'Reset Board',
        onClick: () => {
          this.engine.load(this.startFen);
          this.selected = null;
          this.legalTargets = [];
          this.lastMove = null;
          this.moveLog = [];
          this.render();
        },
      }),
      el('button', {
        class: 'btn btn--ghost btn--sm',
        type: 'button',
        text: 'Undo Move',
        onClick: () => {
          const undone = this.engine.undo();
          if (undone) {
            this.moveLog.pop();
            this.selected = null;
            this.legalTargets = [];
            this.lastMove = null;
            this.render();
          }
        },
      }),
      el('button', {
        class: 'btn btn--ghost btn--sm',
        type: 'button',
        text: 'Flip Board',
        onClick: () => {
          this.flipped = !this.flipped;
          this.render();
        },
      }),
    ]);
  }

  /* --- Interaksi ---------------------------------------------------------- */

  _onSquareClick(event) {
    const node = event.target.closest('.square');
    if (!node || !this.interactive) return;
    this._activate(node.dataset.square);
  }

  _onKeydown(event) {
    const node = event.target.closest('.square');
    if (!node) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this._activate(node.dataset.square);
      return;
    }

    // Panah untuk berpindah antarpetak.
    const deltas = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    const delta = deltas[event.key];
    if (!delta) return;

    event.preventDefault();
    const { r, c } = fromSquare(node.dataset.square);
    const dr = this.flipped ? -delta[0] : delta[0];
    const dc = this.flipped ? -delta[1] : delta[1];
    const nr = r + dr;
    const nc = c + dc;

    if (nr < 0 || nr > 7 || nc < 0 || nc > 7) return;
    const next = this.boardNode.querySelector(`[data-square="${toSquare(nr, nc)}"]`);
    next?.focus();
  }

  _activate(square) {
    // Tahap kedua: petak tujuan sudah dipilih.
    if (this.selected) {
      const target = this.legalTargets.find((m) => m.to === square);

      if (target) {
        this._commitMove(target);
        return;
      }

      if (square === this.selected) {
        this.selected = null;
        this.legalTargets = [];
        this.render();
        return;
      }
    }

    // Tahap pertama: memilih bidak.
    const moves = this.engine.moves({ square, verbose: true });

    if (moves.length === 0) {
      // Umpan balik bahwa petak ini tidak punya langkah sah.
      const node = this.boardNode.querySelector(`[data-square="${square}"]`);
      if (node) {
        node.classList.remove('is-illegal');
        void node.offsetWidth; // paksa reflow agar animasi dapat diulang
        node.classList.add('is-illegal');
      }
      this.selected = null;
      this.legalTargets = [];
      this.render();
      return;
    }

    this.selected = square;
    this.legalTargets = moves;
    this.render();
  }

  async _commitMove(target) {
    let promotion = 'q';

    // Promosi: tanyakan bidak penggantinya terlebih dahulu.
    if (target.promotion) {
      promotion = await this._askPromotion(target.color);
      if (!promotion) {
        this.selected = null;
        this.legalTargets = [];
        this.render();
        return;
      }
    }

    const result = this.engine.move({ from: target.from, to: target.to, promotion });
    if (!result) return;

    this.lastMove = { from: result.from, to: result.to };
    this.moveLog.push(result);
    this.selected = null;
    this.legalTargets = [];
    this.render();

    this.onMove?.(result, this.engine);
  }

  /** Dialog kecil pemilihan bidak promosi. */
  _askPromotion(color) {
    return new Promise((resolve) => {
      const choices = ['q', 'r', 'b', 'n'];

      const panel = el('div', { class: 'panel panel--framed modal__panel' }, [
        el('h2', {
          class: 'heading-3 heading-ink panel__title',
          text: 'Pion mencapai baris terakhir',
        }),
        el('p', {
          class: 'prose',
          style: 'margin-block-end:1rem',
          text:
            'Promosi bersifat wajib. Pilih bidak pengganti — pilihannya bebas dan ' +
            'tidak dibatasi oleh buah catur yang sudah mati sebelumnya.',
        }),
        el(
          'div',
          { style: 'display:flex;gap:.5rem;flex-wrap:wrap' },
          choices.map((type) =>
            el('button', {
              class: 'btn btn--ink',
              type: 'button',
              text: `${UNICODE[color === 'w' ? 'white' : 'black'][type]}  ${PIECE_NAME_ID[type]}`,
              onClick: () => {
                overlay.remove();
                resolve(type);
              },
            })
          )
        ),
      ]);

      const overlay = el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' }, [
        el('div', { class: 'program__backdrop is-open' }),
        panel,
      ]);

      document.body.append(overlay);
      panel.querySelector('button')?.focus();
    });
  }

  /* --- Render -------------------------------------------------------------- */

  render() {
    // Render ulang mengganti seluruh node petak, sehingga petak yang sedang
    // difokus pengguna keyboard akan terlepas dari DOM dan fokusnya lompat
    // ke <body>. Posisi fokus karena itu diingat dulu, lalu dipulihkan ke
    // petak yang sama setelah papan selesai digambar ulang.
    const focusedSquare =
      this.boardNode.contains(document.activeElement) &&
      document.activeElement.classList.contains('square')
        ? document.activeElement.dataset.square
        : null;

    empty(this.boardNode);

    const rows = this.engine.board();
    const order = this.flipped ? [...Array(8).keys()].reverse() : [...Array(8).keys()];
    const colOrder = this.flipped ? [...Array(8).keys()].reverse() : [...Array(8).keys()];

    const kingSquare = this.engine.inCheck()
      ? this.engine.findKing(this.engine.turn())
      : null;

    for (const r of order) {
      for (const c of colOrder) {
        const square = toSquare(r, c);
        const piece = rows[r][c];
        const isLight = (r + c) % 2 === 0;

        const target = this.legalTargets.find((m) => m.to === square);
        const classes = ['square', isLight ? 'square--light' : 'square--dark'];

        if (square === this.selected) classes.push('is-selected');
        if (target) classes.push(target.captured ? 'is-target-capture' : 'is-target');
        if (this.lastMove && (square === this.lastMove.from || square === this.lastMove.to)) {
          classes.push('is-last-move');
        }
        if (kingSquare && kingSquare.r === r && kingSquare.c === c) classes.push('is-check');

        const label = piece
          ? `${square}, ${PIECE_NAME_ID[piece.type]} ${piece.color === 'w' ? 'putih' : 'hitam'}`
          : `${square}, kosong`;

        const node = el('div', {
          class: classes.join(' '),
          role: 'gridcell',
          tabindex: this.interactive ? '0' : '-1',
          dataset: { square },
          'aria-label': target ? `${label}. Langkah sah.` : label,
        });

        if (piece) {
          node.append(
            el('span', {
              class: `piece piece--${piece.color === 'w' ? 'white' : 'black'}`,
              text: UNICODE[piece.color === 'w' ? 'white' : 'black'][piece.type],
              'aria-hidden': 'true',
            })
          );
        }

        // Koordinat hanya di tepi papan, agar tidak memenuhi seluruh petak.
        const isBottomRow = this.flipped ? r === 0 : r === 7;
        const isLeftCol = this.flipped ? c === 7 : c === 0;

        if (isBottomRow) {
          node.append(el('span', { class: 'chessboard__coord chessboard__coord--file', text: FILES[c] }));
        }
        if (isLeftCol) {
          node.append(el('span', { class: 'chessboard__coord chessboard__coord--rank', text: String(8 - r) }));
        }

        this.boardNode.append(node);
      }
    }

    // Kembalikan fokus keyboard ke petak yang sama seperti sebelum render.
    if (focusedSquare) {
      this.boardNode.querySelector(`[data-square="${focusedSquare}"]`)?.focus();
    }

    this._renderStatus();
    if (this.showHistory) this._renderHistory();
  }

  _renderStatus() {
    const turn = this.engine.turn() === 'w' ? 'Putih' : 'Hitam';
    let state = `Giliran ${turn}`;
    let detail = '';

    if (this.engine.isCheckmate()) {
      state = 'Skakmat';
      detail = `${turn} diskakmat. ${turn === 'Putih' ? 'Hitam' : 'Putih'} menang mutlak.`;
    } else if (this.engine.isStalemate()) {
      state = 'Pat (Stalemate)';
      detail = `${turn} tidak terkena skak tetapi tidak punya langkah sah. Permainan remis.`;
    } else if (this.engine.isInsufficientMaterial()) {
      state = 'Remis';
      detail = 'Materi tidak cukup untuk melakukan skakmat.';
    } else if (this.engine.isThreefoldRepetition()) {
      state = 'Remis';
      detail = 'Posisi yang sama telah terjadi tiga kali.';
    } else if (this.engine.isFiftyMoveRule()) {
      state = 'Remis';
      detail = 'Aturan 50 langkah terpenuhi.';
    } else if (this.engine.inCheck()) {
      state = `Giliran ${turn} — SKAK`;
      detail = 'Raja wajib diselamatkan: lari ke petak aman, tutup jalur serangan, atau makan bidak penyerang.';
    }

    empty(this.statusNode);
    this.statusNode.append(
      el('span', { class: 'board-status__turn', text: state }),
      detail ? el('span', { style: 'display:block;margin-block-start:.35rem', text: detail }) : null
    );
  }

  _renderHistory() {
    empty(this.historyNode);

    if (this.moveLog.length === 0) {
      this.historyNode.append(
        el('p', {
          class: 'source-note--on-dark',
          text: 'Riwayat langkah akan muncul di sini. Notasi: R Raja, M Menteri, B Benteng, G Gajah, K Kuda.',
        })
      );
      return;
    }

    for (let i = 0; i < this.moveLog.length; i += 2) {
      this.historyNode.append(
        el('div', { class: 'move-history__row' }, [
          el('span', { class: 'move-history__no', text: `${i / 2 + 1}.` }),
          el('span', { text: this.moveLog[i]?.san ?? '' }),
          el('span', { text: this.moveLog[i + 1]?.san ?? '' }),
        ])
      );
    }

    this.historyNode.scrollTop = this.historyNode.scrollHeight;
  }

  /** Mengganti posisi papan, misalnya saat memperagakan aturan tertentu. */
  setPosition(fen, { highlightFrom = null } = {}) {
    this.engine.load(fen);
    this.startFen = fen;
    this.selected = highlightFrom;
    this.legalTargets = highlightFrom
      ? this.engine.moves({ square: highlightFrom, verbose: true })
      : [];
    this.lastMove = null;
    this.moveLog = [];
    this.render();
  }
}

/** Papan kecil non-interaktif untuk memperagakan satu pola gerak. */
export function demoBoard(fen, highlightFrom) {
  const board = new Chessboard({
    fen,
    interactive: true,
    showControls: false,
    showHistory: false,
  });
  if (highlightFrom) board.setPosition(fen, { highlightFrom });
  return board;
}

export default { Chessboard, demoBoard };
