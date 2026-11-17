/**
 * tools/verify-questions.mjs
 * ==========================
 * Membuktikan setiap kunci jawaban di data/chess-questions.js terhadap mesin
 * aturan catur, bukan terhadap keyakinan penulis soal.
 *
 * Jalankan:  node tools/verify-questions.mjs
 */

globalThis.window = { TGG_LIBS: { chess: false } };

const { InternalChess } = await import('../js/features/chess-engine.js');
const { questions } = await import('../data/chess-questions.js');

let pass = 0;
let fail = 0;

function report(ok, id, detail) {
  if (ok) pass += 1;
  else fail += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id.padEnd(24)} ${detail}`);
}

for (const q of questions) {
  const game = new InternalChess(q.fen);
  const legal = game.moves({ verbose: true });
  const v = q.verify;

  // Setiap soal harus punya kunci jawaban yang berada dalam rentang pilihan.
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) {
    report(false, q.id, `indeks jawaban di luar jangkauan: ${q.answer}`);
    continue;
  }

  switch (v.kind) {
    case 'legal': {
      const found = legal.find(
        (m) => m.from === v.move.from && m.to === v.move.to &&
          (!v.move.promotion || m.promotion === v.move.promotion)
      );
      report(Boolean(found), q.id, found ? `${found.san} sah` : `${v.move.from}${v.move.to} TIDAK sah`);
      break;
    }

    case 'illegal': {
      const found = legal.find((m) => m.from === v.move.from && m.to === v.move.to);
      report(!found, q.id, found ? `${v.move.from}${v.move.to} ternyata SAH` : `${v.move.from}${v.move.to} memang tidak sah`);
      break;
    }

    case 'mate': {
      const result = game.move(v.move);
      const mate = Boolean(result) && game.isCheckmate();
      report(mate, q.id, result ? `${result.san} -> skakmat: ${game.isCheckmate()}` : 'langkah tidak sah');
      break;
    }

    case 'state': {
      const checks = {
        stalemate: () => game.isStalemate(),
        checkmate: () => game.isCheckmate(),
        check: () => game.inCheck(),
        insufficient: () => game.isInsufficientMaterial(),
      };
      const ok = checks[v.state]?.() ?? false;
      report(ok, q.id, `${v.state} = ${ok}`);
      break;
    }

    case 'unreachable': {
      // Telusuri seluruh petak yang dapat dicapai bidak dari `from`
      // melalui langkah berulang pada papan kosong.
      const reached = new Set([v.from]);
      const queue = [v.from];

      while (queue.length) {
        const square = queue.shift();
        const probe = new InternalChess(q.fen);

        // Pindahkan bidak ke petak yang sedang ditelusuri.
        if (square !== v.from) {
          const piece = probe.at(...Object.values(fromSq(v.from)));
          probe.set(...Object.values(fromSq(v.from)), null);
          probe.set(...Object.values(fromSq(square)), piece);
        }

        for (const m of probe.moves({ square, verbose: true })) {
          if (!reached.has(m.to)) {
            reached.add(m.to);
            queue.push(m.to);
          }
        }
      }

      const ok = !reached.has(v.square);
      report(ok, q.id, ok
        ? `${v.square} memang mustahil dicapai dari ${v.from}`
        : `${v.square} ternyata DAPAT dicapai dari ${v.from}`);
      break;
    }

    default:
      report(false, q.id, `jenis verifikasi tidak dikenal: ${v.kind}`);
  }
}

function fromSq(sq) {
  return { r: 8 - Number(sq[1]), c: 'abcdefgh'.indexOf(sq[0]) };
}

console.log(`\n${questions.length} soal diperiksa — ${pass} lulus, ${fail} gagal`);
process.exit(fail ? 1 : 0);
