/**
 * js/features/the-portrait.js
 * ===========================
 * Babak I — Sang Tokoh. Modul penyusun babak.
 *
 * Urutan penyajian mengikuti dokumen konsep:
 *   1. Pengantar singkat
 *   2. Profil ringkas
 *   3. Infografis
 *   4. Video dokumenter singkat
 *   5. Lini masa perjalanan hidup dan karier
 *   6. Penutup
 *
 * Infografis dan video berada dalam satu halaman dan tidak dipisah.
 */

import { el } from '../utils/helpers.js';
import { profile, requiredAssets } from '../../data/irene-profile.js';
import { achievements } from '../../data/achievements.js';
import { renderInfographic } from './infographic-viewer.js';
import { renderVideo } from './video-player.js';

/* ===========================================================================
   Bagian-bagian halaman
   ======================================================================== */

function sectionIntro() {
  return el('div', { class: 'panel panel--framed' }, [
    el('h2', { class: 'heading-3 heading-ink panel__title', text: 'Pengantar' }),
    el('div', { class: 'prose' }, [el('p', { text: profile.pengantar })]),

    el('div', { class: 'profile-facts' }, [
      fact('Nama lengkap', profile.namaLengkap),
      fact('Lahir', `${profile.lahir.tanggal}, ${profile.lahir.tempat}`),
      fact('Gelar', profile.gelarTerkini),
      fact('FIDE ID', profile.fideId),
      fact('Panutan', `${profile.panutan.nama} (${profile.panutan.asal})`),
      fact('Pembimbing', profile.pendidikan[0].pembimbing),
    ]),
  ]);
}

function fact(label, value) {
  return el('div', { class: 'profile-fact' }, [
    el('span', { class: 'profile-fact__label', text: label }),
    el('span', { class: 'profile-fact__value', text: value }),
  ]);
}

function sectionTitles() {
  return el('div', { class: 'panel' }, [
    el('h2', { class: 'heading-3 heading-ink panel__title', text: 'Riwayat Gelar' }),
    el('div', { class: 'table-scroll' }, [
      el('table', { class: 'data-table' }, [
        el('caption', { text: 'Kenaikan gelar catur secara bertahap' }),
        el('thead', {}, [
          el('tr', {}, [
            el('th', { scope: 'col', text: 'Tahun' }),
            el('th', { scope: 'col', text: 'Gelar' }),
            el('th', { scope: 'col', text: 'Keterangan' }),
          ]),
        ]),
        el(
          'tbody',
          {},
          profile.gelar.map((item) =>
            el('tr', {}, [
              el('td', { class: 'num', text: String(item.tahun) }),
              el('td', {}, [el('strong', { text: item.nama })]),
              el('td', {}, [
                el('span', { text: item.keterangan ?? '—' }),
                item.catatanVerifikasi
                  ? el('span', {
                      class: 'source-note',
                      style: 'display:block;margin-block-start:.35rem',
                      text: `Catatan verifikasi: ${item.catatanVerifikasi}`,
                    })
                  : null,
              ]),
            ])
          )
        ),
      ]),
    ]),
  ]);
}

function sectionEducation() {
  return el('div', { class: 'panel panel--prose' }, [
    el('h2', { class: 'heading-3 heading-ink panel__title', text: 'Pembinaan dan Pendidikan' }),
    el(
      'div',
      { class: 'prose' },
      profile.pendidikan.map((item) =>
        el('p', {}, [
          el('strong', { text: `${item.lembaga}. ` }),
          document.createTextNode(item.keterangan),
          item.pembimbing
            ? document.createTextNode(` Dibimbing langsung oleh ${item.pembimbing}.`)
            : null,
        ])
      )
    ),
    el('div', { class: 'prose', style: 'margin-block-start:1rem' }, [
      el('p', {}, [
        el('strong', { text: 'Dukungan keluarga. ' }),
        document.createTextNode(profile.orangTua.catatan),
      ]),
    ]),
  ]);
}

/** Lini masa dibangun dari arsip prestasi, jadi tidak ada tahun yang diketik ulang. */
function sectionTimeline() {
  const byYear = new Map();
  for (const item of achievements) {
    if (!byYear.has(item.year)) byYear.set(item.year, []);
    byYear.get(item.year).push(item);
  }

  const years = [...byYear.keys()].sort((a, b) => a - b);

  return el('div', {}, [
    el('h2', {
      class: 'heading-2 heading-gold',
      style: 'margin-block-end:.5rem',
      text: 'Lini Masa Perjalanan',
    }),
    el('p', {
      class: 'source-note--on-dark',
      style: 'margin-block-end:1.5rem',
      text:
        `${achievements.length} pencapaian tercatat, dari ${years[0]} sampai ` +
        `${years[years.length - 1]}. Arsip lengkap beserta detailnya ada di Babak IV.`,
    }),

    el(
      'div',
      { class: 'life-timeline' },
      years.map((year) =>
        el('div', { class: 'life-timeline__item' }, [
          el('p', { class: 'life-timeline__year', text: String(year) }),
          el(
            'div',
            { class: 'life-timeline__body' },
            byYear.get(year).map((item) =>
              el('p', { style: 'margin-block-end:.4rem' }, [
                el('strong', { text: `${item.event} — ` }),
                document.createTextNode(item.result),
              ])
            )
          ),
        ])
      )
    ),
  ]);
}

function sectionClosing() {
  return el('div', { class: 'panel panel--cream panel--framed panel--prose' }, [
    el('h2', { class: 'heading-3 heading-ink panel__title', text: 'Penutup Babak I' }),
    el('div', { class: 'prose' }, [el('p', { text: profile.penutup })]),
  ]);
}

/* ===========================================================================
   Render
   ======================================================================== */

export async function render(host) {
  host.append(
    el('div', { class: 'stack' }, [
      sectionIntro(),

      el('div', {}, [
        el('h2', {
          class: 'heading-2 heading-gold',
          style: 'margin-block-end:1rem;text-align:center',
          text: 'Infografis',
        }),
        renderInfographic(requiredAssets.infographic),
      ]),

      el('div', {}, [
        el('h2', {
          class: 'heading-2 heading-gold',
          style: 'margin-block-end:1rem;text-align:center',
          text: 'Video Dokumenter Singkat',
        }),
        renderVideo(requiredAssets.video),
      ]),

      sectionEducation(),
      sectionTitles(),
      sectionTimeline(),
      sectionClosing(),
    ])
  );
}

export default { render };
