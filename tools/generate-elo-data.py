#!/usr/bin/env python3
"""
generate-elo-data.py
--------------------
Mengubah ekspor CSV rating FIDE menjadi modul ES data/elo-ratings.js.

Tujuan skrip ini adalah integritas data: 206 periode rating tidak diketik
ulang dengan tangan, sehingga mustahil terjadi salah ketik angka. Periode
tanpa rilis rating disimpan sebagai `null`, BUKAN 0 dan BUKAN hasil
interpolasi.

Pakai:  python3 -I tools/generate-elo-data.py <input.csv> <output.js>
"""
import csv
import json
import sys
from datetime import date

BULAN = {
    "01": "Januari", "02": "Februari", "03": "Maret", "04": "April",
    "05": "Mei", "06": "Juni", "07": "Juli", "08": "Agustus",
    "09": "September", "10": "Oktober", "11": "November", "12": "Desember",
}


def label_periode(period: str) -> str:
    tahun, bulan = period.split("-")
    return f"{BULAN[bulan]} {tahun}"


def baca(path: str):
    with open(path, newline="", encoding="utf-8") as fh:
        baris = list(csv.DictReader(fh))
    titik = []
    for r in baris:
        titik.append({
            "period": r["Month"].strip(),
            "label": label_periode(r["Month"].strip()),
            "standard": int(r["Classical"]) if r["Classical"].strip() else None,
            "rapid": int(r["Rapid"]) if r["Rapid"].strip() else None,
            "blitz": int(r["Blitz"]) if r["Blitz"].strip() else None,
        })
    return titik


def rentang_kosong(titik, kunci):
    """Mendeteksi blok periode berurutan yang tidak punya nilai."""
    blok, mulai = [], None
    for t in titik:
        if t[kunci] is None:
            if mulai is None:
                mulai = t["period"]
            akhir = t["period"]
        elif mulai is not None:
            blok.append((mulai, akhir))
            mulai = None
    if mulai is not None:
        blok.append((mulai, akhir))
    return blok


def main():
    src, dst = sys.argv[1], sys.argv[2]
    titik = baca(src)

    # Lubang data yang muncul SETELAH kategori tersebut mulai dicatat FIDE.
    # Lubang sebelum rilis pertama (mis. Rapid sebelum 2013) bukan anomali.
    anomali = {}
    for kunci in ("standard", "rapid", "blitz"):
        ada = [t["period"] for t in titik if t[kunci] is not None]
        if not ada:
            continue
        pertama, terakhir = ada[0], ada[-1]
        dalam = [t for t in titik if pertama <= t["period"] <= terakhir]
        anomali[kunci] = rentang_kosong(dalam, kunci)

    baris_js = ",\n".join(
        "  { period: %-10s label: %-22s standard: %-5s rapid: %-5s blitz: %-5s }" % (
            json.dumps(t["period"]) + ",",
            json.dumps(t["label"]) + ",",
            ("null" if t["standard"] is None else str(t["standard"])) + ",",
            ("null" if t["rapid"] is None else str(t["rapid"])) + ",",
            ("null" if t["blitz"] is None else str(t["blitz"])),
        )
        for t in titik
    )

    catatan = []
    for kunci, blok in anomali.items():
        for mulai, akhir in blok:
            catatan.append({
                "kategori": kunci,
                "dari": mulai,
                "sampai": akhir,
                "keterangan": (
                    "Tidak ada nilai pada ekspor CSV sumber untuk rentang ini, "
                    "padahal kategori sudah aktif dicatat sebelum dan sesudahnya. "
                    "Diduga ekspor tidak lengkap, bukan penghentian rating. "
                    "Nilai disimpan null dan garis grafik sengaja diputus."
                ),
            })

    out = f'''/**
 * data/elo-ratings.js
 * ===================
 * Riwayat rating FIDE Irene Kharisma Sukandar (FIDE ID 7101384).
 *
 * BERKAS INI DIBUAT OTOMATIS — JANGAN DIEDIT MANUAL.
 * Sumber  : ekspor CSV riwayat rating FIDE (Classical / Rapid / Blitz)
 * Generator: tools/generate-elo-data.py
 * Dibuat  : {date.today().isoformat()}
 *
 * ATURAN INTEGRITAS DATA
 * ----------------------
 * 1. Periode tanpa rilis rating bernilai `null`, bukan 0 dan bukan hasil
 *    interpolasi. Semua perhitungan statistik wajib menyaring null.
 * 2. Kolom `gamesPlayed` TIDAK tersedia pada ekspor sumber, sehingga tidak
 *    disertakan. Mengisinya berarti mengarang data.
 * 3. Catatan turnamen disimpan terpisah di `eloMilestones`, hanya untuk
 *    peristiwa yang sudah diverifikasi terhadap sumber publik.
 */

export const eloMeta = {{
  pemain: 'Irene Kharisma Sukandar',
  fideId: '7101384',
  sumber: 'Ekspor riwayat rating resmi FIDE (Standard, Rapid, Blitz)',
  jumlahPeriode: {len(titik)},
  periodeAwal: {json.dumps(titik[0]["period"])},
  periodeAkhir: {json.dumps(titik[-1]["period"])},
  catatanPenting:
    'Rating FIDE untuk pemain non-aktif dibawa turun dari rilis sebelumnya. ' +
    'Garis datar pada grafik berarti tidak ada partai berperingkat, ' +
    'bukan berarti performa stagnan.',
}};

/**
 * Lubang data pada ekspor sumber. Ditampilkan apa adanya di website agar
 * pembaca tahu batas datanya, sesuai prinsip "tandai untuk diperiksa,
 * jangan karang penggantinya".
 */
export const eloDataGaps = {json.dumps(catatan, indent=2, ensure_ascii=False)};

/** @type {{{{ period: string, label: string, standard: number|null, rapid: number|null, blitz: number|null }}[]}} */
export const eloSeries = [
{baris_js},
];

export default eloSeries;
'''
    with open(dst, "w", encoding="utf-8") as fh:
        fh.write(out)

    print(f"OK  {len(titik)} periode -> {dst}")
    for kunci, blok in anomali.items():
        if blok:
            print(f"  ANOMALI {kunci}: {blok}")


if __name__ == "__main__":
    main()
