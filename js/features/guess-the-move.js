/**
 * js/features/guess-the-move.js
 * =============================
 * Permainan mini edukatif: menebak langkah yang benar dari sebuah posisi.
 *
 * Bersifat edukatif, bukan permainan kompleks. Setiap jawaban — benar maupun
 * salah — selalu disertai penjelasan mengapa demikian, karena justru di situ
 * nilai belajarnya.
 *
 * Skor tertinggi disimpan lokal lewat storage.js, tanpa akun dan tanpa
 * leaderboard daring.
 */

import { el, empty, $$ } from '../utils/helpers.js';
import { questions, LEVEL_LABEL } from '../../data/chess-questions.js';
import { demoBoard } from './chessboard.js';
import { read, write, KEYS } from '../storage.js';
import { markCompleted } from '../progress-tracker.js';

export function createQuiz() {
  const root = el('div', { class: 'quiz' });

  let index = 0;
  let score = 0;
  let answered = false;

  const meta = el('div', { class: 'quiz__meta' });
  const boardHost = el('div', {});
  const panel = el('div', { class: 'panel panel--framed' });

  function renderMeta() {
    const best = read(KEYS.QUIZ_BEST, 0);
    empty(meta);
    meta.append(
      el('span', { text: `Soal ${index + 1} dari ${questions.length}` }),
      el('span', { text: `Skor ${score}` }),
      el('span', { text: `Rekor terbaik ${best} dari ${questions.length}` })
    );
  }

  function renderQuestion() {
    answered = false;
    const question = questions[index];

    renderMeta();

    const board = demoBoard(question.fen);
    boardHost.replaceChildren(board.element);

    const feedback = el('div', { class: 'quiz__feedback', hidden: true, role: 'status', 'aria-live': 'polite' });

    const options = el(
      'div',
      { class: 'quiz__options' },
      question.options.map((text, optionIndex) =>
        el('button', {
          class: 'quiz__option',
          type: 'button',
          text: `${String.fromCharCode(65 + optionIndex)}. ${text}`,
          onClick: (event) => choose(optionIndex, event.currentTarget, feedback),
        })
      )
    );

    const hintButton = el('button', {
      class: 'btn btn--ghost btn--sm',
      type: 'button',
      text: 'Tampilkan petunjuk',
      onClick: () => {
        hintButton.replaceWith(
          el('p', { class: 'source-note', style: 'font-style:italic', text: question.hint })
        );
      },
    });

    panel.replaceChildren(
      el('div', { style: 'display:flex;gap:.75rem;flex-wrap:wrap;align-items:center;margin-block-end:1rem' }, [
        el('span', { class: 'plaque', text: question.topic }),
        el('span', { class: 'eyebrow', text: LEVEL_LABEL[question.level] }),
      ]),
      el('p', { class: 'lede', style: 'margin-block-end:1.25rem', text: question.prompt }),
      options,
      question.hint ? hintButton : null,
      feedback,
      el('div', { class: 'quiz__nav', style: 'margin-block-start:1.25rem' })
    );
  }

  function choose(optionIndex, button, feedback) {
    if (answered) return;
    answered = true;

    const question = questions[index];
    const correct = optionIndex === question.answer;
    if (correct) score += 1;

    // Tandai pilihan dan selalu tunjukkan jawaban yang benar.
    $$('.quiz__option', panel).forEach((node, i) => {
      node.disabled = true;
      if (i === question.answer) node.classList.add('is-correct');
      else if (i === optionIndex) node.classList.add('is-wrong');
    });

    feedback.hidden = false;
    feedback.className = 'quiz__feedback';
    feedback.style.background = correct ? 'rgb(63 122 77 / 16%)' : 'rgb(142 27 38 / 12%)';
    feedback.style.border = correct
      ? '1px solid rgb(63 122 77 / 55%)'
      : '1px solid rgb(142 27 38 / 45%)';

    empty(feedback);
    feedback.append(
      el('p', {
        style: 'font-weight:600;margin-block-end:.5rem',
        text: correct ? 'Benar.' : 'Belum tepat.',
      }),
      el('p', { text: question.explanation })
    );

    renderMeta();
    renderNav();
  }

  function renderNav() {
    const nav = panel.querySelector('.quiz__nav');
    if (!nav) return;

    empty(nav);

    if (index < questions.length - 1) {
      nav.append(
        el('button', {
          class: 'btn btn--gold',
          type: 'button',
          text: 'Soal Berikutnya',
          onClick: () => {
            index += 1;
            renderQuestion();
            panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          },
        })
      );
      return;
    }

    // Soal terakhir: simpan rekor dan tawarkan mengulang.
    const best = read(KEYS.QUIZ_BEST, 0);
    if (score > best) write(KEYS.QUIZ_BEST, score);

    // Menyelesaikan seluruh soal dihitung sebagai interaksi bermakna.
    markCompleted('act-arena');

    nav.append(
      el('div', { class: 'ticket', style: 'margin-block-end:1rem' }, [
        el('span', { class: 'ticket__label', text: 'Skor akhir' }),
        el('span', { class: 'ticket__value', text: `${score} / ${questions.length}` }),
        el('span', {
          class: 'ticket__meta',
          text:
            score === questions.length
              ? 'Seluruh soal terjawab benar.'
              : score > best
                ? 'Rekor pribadi baru.'
                : `Rekor terbaik Anda ${Math.max(best, score)} dari ${questions.length}.`,
        }),
      ]),
      el('button', {
        class: 'btn btn--gold',
        type: 'button',
        text: 'Ulangi Permainan',
        onClick: () => {
          index = 0;
          score = 0;
          renderQuestion();
          panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        },
      })
    );
  }

  root.append(
    meta,
    el('div', { class: 'arena-layout' }, [boardHost, panel])
  );

  renderQuestion();
  return root;
}

export default { createQuiz };
