globalThis.window = { TGG_LIBS: { chess: false } };
const { InternalChess } = await import('../js/features/chess-engine.js');

function perft(game, depth) {
  if (depth === 0) return 1;
  const moves = game.moves({ verbose: true });
  if (depth === 1) return moves.length;
  let total = 0;
  for (const m of moves) {
    const undo = game._apply(m);
    total += perft(game, depth - 1);
    game._revert(undo);
  }
  return total;
}

const cases = [
  ['Posisi awal', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', [20, 400, 8902, 197281]],
  ['Kiwipete (rokade+ep)', 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1', [48, 2039, 97862]],
  ['Posisi 3 (endgame)', '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1', [14, 191, 2812, 43238]],
  ['Posisi 4 (promosi)', 'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1', [6, 264, 9467]],
  ['Posisi 5', 'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8', [44, 1486, 62379]],
];

let pass = 0, fail = 0;
for (const [name, fen, expected] of cases) {
  for (let d = 0; d < expected.length; d++) {
    const g = new InternalChess(fen);
    const t0 = Date.now();
    const got = perft(g, d + 1);
    const ok = got === expected[d];
    ok ? pass++ : fail++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(22)} depth ${d + 1}: ${String(got).padStart(7)} (harap ${expected[d]})  ${Date.now() - t0}ms`);
  }
}
console.log(`\n${pass} lulus, ${fail} gagal`);
process.exit(fail ? 1 : 0);
