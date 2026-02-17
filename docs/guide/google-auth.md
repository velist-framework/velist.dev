# Google OAuth Setup Guide

Panduan lengkap untuk mengaktifkan login dengan Google (Google Sign-In) di aplikasi Velist.

---

## Overview

Velist mendukung autentikasi menggunakan Google OAuth 2.0. Dengan fitur ini, pengguna dapat login atau register menggunakan akun Google mereka tanpa perlu membuat password.

## Prerequisites

- Akun Google (Gmail/Google Workspace)
- Akses ke [Google Cloud Console](https://console.cloud.google.com/)

---

## Step-by-Step Setup

### 1. Buat Project di Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Klik dropdown project di top navigation bar → **New Project**
3. Masukkan:
   - **Project name**: `Velist App` (atau nama aplikasi Anda)
   - **Location**: Optional (bisa dikosongkan)
4. Klik **Create**
5. Tunggu beberapa saat sampai project selesai dibuat, kemudian pilih project tersebut dari dropdown

---

### 2. Enable Google+ API

1. Di sidebar kiri, klik **APIs & Services** → **Library**
2. Cari **Google+ API** (atau "Google People API")
3. Klik hasil pencarian, kemudian klik **Enable**
4. Tunggu sampai API enabled (biasanya sekitar 1-2 menit)

> **Note**: Google+ API deprecated, gunakan **Google People API** untuk mendapatkan profile info.

---

### 3. Konfigurasi OAuth Consent Screen

1. Di sidebar kiri, klik **APIs & Services** → **OAuth consent screen**
2. Pilih **External** (untuk aplikasi yang bisa diakses siapa saja) atau **Internal** (hanya untuk Google Workspace organization)
3. Klik **Create**
4. Isi informasi berikut:

#### App Information
| Field | Value |
|-------|-------|
| **App name** | Velist App (atau nama aplikasi Anda) |
| **User support email** | Email support Anda |
| **App logo** | Optional - bisa upload logo aplikasi |

#### App Domain
| Field | Value |
|-------|-------|
| **Application home page** | `http://localhost:3000` (dev) atau domain production |
| **Application privacy policy link** | URL ke privacy policy |
| **Application terms of service link** | URL ke terms of service |

#### Authorized Domains
Tambahkan domain Anda:
- `localhost` (untuk development)
- `yourdomain.com` (untuk production)

5. Klik **Save and Continue**
6. Di halaman **Scopes**, klik **Add or Remove Scopes**
7. Cari dan pilih scopes berikut:
   - `openid`
   - `email`
   - `profile`
8. Klik **Update**, kemudian **Save and Continue**
9. Di halaman **Test Users**, tambahkan email Anda untuk testing (khusus External app yang belum verified)
10. Klik **Save and Continue** → **Back to Dashboard**

---

### 4. Buat OAuth 2.0 Credentials

1. Di sidebar kiri, klik **APIs & Services** → **Credentials**
2. Klik **Create Credentials** → **OAuth client ID**
3. Pilih **Application type**: `Web application`
4. Isi informasi:

| Field | Value |
|-------|-------|
| **Name** | Velist Web Client |
| **Authorized JavaScript origins** | `http://localhost:3000` |
| **Authorized redirect URIs** | `http://localhost:3000/auth/google/callback` |

5. Untuk production, tambahkan juga:
   - **Authorized JavaScript origins**: `https://yourdomain.com`
   - **Authorized redirect URIs**: `https://yourdomain.com/auth/google/callback`

6. Klik **Create**
7. **Segera copy** Client ID dan Client Secret yang muncul!
   - Klik **Download JSON** untuk menyimpan credentials (opsional tapi direkomendasikan)

> ⚠️ **PENTING**: Client Secret hanya ditampilkan sekali. Jika hilang, Anda harus create new credentials.

---

### 5. Konfigurasi di Aplikasi Velist

1. Buka file `.env` di root project
2. Tambahkan atau update variabel berikut:

```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Optional: Custom redirect URI untuk production
# GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
```

3. Restart aplikasi:

```bash
bun run dev
```

---

## Testing

1. Buka aplikasi di browser: `http://localhost:3000`
2. Klik menu **Login** atau **Register**
3. Klik tombol **"Sign in with Google"**
4. Pilih akun Google Anda
5. Jika berhasil, Anda akan di-redirect ke dashboard

---

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Penyebab**: Redirect URI di Google Console tidak cocok dengan yang dikirim aplikasi.

**Solusi**:
- Pastikan `http://localhost:3000/auth/google/callback` sudah ditambahkan di Authorized redirect URIs
- Periksa tidak ada trailing slash atau typo
- Untuk production, pastikan protocol adalah `https://`

### Error: "unauthorized_client"

**Penyebab**: OAuth consent screen belum dikonfigurasi atau app masih dalam status "Testing".

**Solusi**:
- Pastikan sudah mengisi OAuth consent screen (Step 3)
- Tambahkan email Anda sebagai Test User jika app status-nya "Testing"

### Error: "access_denied"

**Penyebab**: User menolak permission atau scope tidak sesuai.

**Solusi**:
- Pastikan scopes `openid`, `email`, `profile` sudah ditambahkan
- Coba hapus cookies dan coba lagi

### Error: "invalid_client" saat callback

**Penyebab**: Client Secret salah atau environment variable belum ter-load.

**Solusi**:
- Periksa `.env` file sudah benar
- Pastikan tidak ada spasi di awal/akhir Client ID dan Secret
- Restart server setelah mengubah `.env`

---

## Production Checklist

Sebelum deploy ke production, pastikan:

- [ ] OAuth consent screen sudah **Published** (bukan Testing)
- [ ] App sudah **verified** oleh Google (untuk sensitive scopes)
- [ ] Redirect URI production sudah ditambahkan
- [ ] `GOOGLE_REDIRECT_URI` di `.env` production sudah sesuai
- [ ] Privacy Policy dan Terms of Service sudah tersedia online
- [ ] App name dan logo sudah final (tidak bisa gampang diubah setelah verified)

### Publishing OAuth Consent Screen

1. Di Google Cloud Console, buka **APIs & Services** → **OAuth consent screen**
2. Klik **PUBLISH APP**
3. Konfirmasi dengan klik **Confirm**
4. Tunggu review dari Google (bisa memakan waktu beberapa hari untuk sensitive scopes)

---

## Security Best Practices

1. **Jangan commit `.env` file** ke repository
2. **Rotate Client Secret** secara berkala (3-6 bulan)
3. **Gunakan HTTPS** untuk production
4. **Validasi state parameter** untuk mencegah CSRF attack (sudah dihandle oleh Velist)
5. **Limit scope** - hanya minta permission yang benar-benar diperlukan

---

## References

- [Google Identity Platform - OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Arctic Documentation](https://arcticjs.dev/) - OAuth library yang digunakan Velist
