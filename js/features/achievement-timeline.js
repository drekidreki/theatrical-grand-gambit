/**
 * js/features/achievement-timeline.js
 * ===================================
 * Lini masa dan statistik arsip prestasi.
 *
 * Seluruh prestasi dari dokumen sumber ditampilkan secara kronologis; tidak
 * ada yang dihapus demi memperpendek tampilan. Angka pada panel statistik
 * DIHITUNG dari array data, bukan diketik manual.
 */

import { el, empty } from '../utils/helpers.js';
import { achievements, CATEGORY_LABEL, sources } from '../../data/achievements.js';

/* ===========================================================================
   Statistik pencapaian — seluruhnya dihitung dari dataset
   ======================================================================== */

export function achievementStats(list = achievements) {
  const years = list.map((item) => item.year);
  const byCategory = new Map();

  for (const item of list) {
    byCategory.set(item.category, (byCategory.get(item.category) ?? 0) + 1);
  }

  // Beberapa baris mencatat lebih dari satu medali, mis. "2 Medali Perak".
  // Angka itu diambil dari teks hasilnya, bukan ditebak.
  let medalCount = 0;
  for (const item of list) {
    if (!['emas', 'perak', 'perunggu'].includes(item.category)) continue;
    const match = item.result.match(/(\d+)\s*Medali/i);
    medalCount += match ? Number(match[1]) : 1;
  }

  return {
    total: list.length,
    firstYear: Math.min(...years),
    lastYear: Math.max(...years),
    span: Math.max(...years) - Math.min(...years),
    medalCount,
    titleCount: list.filter((item) => item.category === 'gelar').length,
    milestoneCount: list.filter((item) => item.milestone).length,
    byCategory: [...byCategory.entries()].sort((a, b) => b[1] - a[1]),
    verifiedCount: list.filter((item) => item.verified).length,
  };
}

function statTicket(label, value, meta) {
  return el('div', { class: 'ticket' }, [
    el('span', { class: 'ticket__label', text: label }),
    el('span', { class: 'ticket__value', text: String(value) }),
    meta ? el('span', { class: 'ticket__meta', text: meta }) : null,
  ]);
}

export function renderAchievementStats() {
  const stats = achievementStats();

  return el('div', {}, [
    el('div', { class: 'scoreboard' }, [
      statTicket('Pencapaian tercatat', stats.total, `Sejak ${stats.firstYear} sampai ${stats.lastYear}`),
      statTicket('Rentang karier', `${stats.span} th`, 'Dari kejuaraan ASEAN sampai SEA Games'),
      statTicket('Medali', stats.medalCount, 'Emas, perak, dan perunggu'),
      statTicket('Gelar internasional', stats.titleCount, 'WGM dan IM'),
    ]),

    el('div', { class: 'panel panel--cream', style: 'margin-block-start:1.5rem' }, [
      el('h4', {
        class: 'heading-4 heading-ink',
        style: 'margin-block-end:.75rem',
        text: 'Sebaran berdasarkan jenis pencapaian',
      }),
      el('div', { class: 'table-scroll' }, [
        el('table', { class: 'data-table' }, [
          el('thead', {}, [
            el('tr', {}, [
              el('th', { scope: 'col', text: 'Jenis' }),
              el('th', { scope: 'col', text: 'Jumlah catatan' }),
            ]),
          ]),
          el('tbody', {}, stats.byCategory.map(([category, count]) =>
            el('tr', {}, [
              el('td', { text: CATEGORY_LABEL[category] ?? category }),
              el('td', { class: 'num', text: String(count) }),
            ])
          )),
        ]),
      ]),
      el('p', {
        class: 'source-note',
        style: 'margin-block-start:.75rem',
        text:
          `Seluruh angka pada panel ini dihitung langsung dari ${stats.total} baris ` +
          `arsip prestasi, bukan diketik manual. ${stats.verifiedCount} di antaranya ` +
          'dilengkapi detail yang sudah dicocokkan dengan arsip publik.',
      }),
    ]),
  ]);
}

/* ===========================================================================
   Lini masa
   ======================================================================== */

export function renderAchievementTimeline() {
  // Urutan kronologis dipertahankan; prestasi penting hanya disorot, tidak
  // dipindahkan ke atas.
  const sorted = [...achievements].sort((a, b) => a.year - b.year);

  const timeline = el('div', { class: 'achievements' },
    sorted.map((item) => {
      const card = el('div', { class: 'achievement__card' }, [
        el('p', { class: 'achievement__event', text: item.event }),
        el('p', { class: 'achievement__result', text: item.result }),
        item.location && item.location !== '—'
          ? el('p', {
              class: 'source-note--on-dark',
              style: 'margin-block-start:.35rem',
              text: item.location,
            })
          : null,
        item.badge ? el('span', { class: 'achievement__badge', text: item.badge }) : null,
      ]);

      // Detail tambahan dan catatan perbedaan antarsumber dapat dibuka.
      if (item.verified || item.note) {
        const detail = el('div', { hidden: true, style: 'margin-block-start:.75rem' }, [
          item.verified
            ? el('p', {
                class: 'achievement__result',
                style: 'border-inline-start:2px solid var(--color-old-gold);padding-inline-start:.75rem',
                text: item.verified,
              })
            : null,
          item.note
            ? el('p', {
                class: 'source-note--on-dark',
                style: 'margin-block-start:.5rem;border-inline-start:2px solid var(--color-blood-red);padding-inline-start:.75rem',
                text: `Catatan verifikasi: ${item.note}`,
              })
            : null,
        ]);

        const toggle = el('button', {
          class: 'btn btn--ghost btn--sm',
          type: 'button',
          style: 'margin-block-start:.75rem',
          'aria-expanded': 'false',
          text: 'Lihat detail',
          onClick: () => {
            const open = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!open));
            toggle.textContent = open ? 'Lihat detail' : 'Sembunyikan detail';
            detail.hidden = open;
          },
        });

        card.append(toggle, detail);
      }

      return el('div', {
        class: `achievement${item.milestone ? ' achievement--milestone' : ''}`,
      }, [
        el('span', { class: 'achievement__dot', 'aria-hidden': 'true' }),
        el('p', { class: 'achievement__year', text: String(item.year) }),
        card,
      ]);
    })
  );

  return el('div', {}, [
    timeline,
    el('div', { class: 'panel panel--cream', style: 'margin-block-start:1.5rem' }, [
      el('h4', {
        class: 'heading-4 heading-ink',
        style: 'margin-block-end:.5rem',
        text: 'Sumber arsip prestasi',
      }),
      el('ul', { class: 'prose' }, sources.map((source) => el('li', { text: source }))),
    ]),
  ]);
}

export default { renderAchievementTimeline, renderAchievementStats, achievementStats };
