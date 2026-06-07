#!/bin/bash
# Script instalasi otomatis Android SDK Headless untuk Cozy Dashboard
# Pastikan bash berjalan aman
set -euo pipefail

SDK_DIR="/home/tegoeh/Android/Sdk"
ZIP_PATH="/tmp/cmdline-tools.zip"

echo "=================================================================="
echo "      MEMULAI INSTALASI HEADLESS ANDROID SDK (API 34)             "
echo "=================================================================="

echo "==> 1. Membuat direktori tujuan SDK..."
mkdir -p "$SDK_DIR/cmdline-tools"

echo "==> 2. Mengunduh Android Command Line Tools resmi dari Google..."
# Menggunakan commandlinetools versi 11076708 (stabil)
wget -q --show-progress "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip" -O "$ZIP_PATH"

echo "==> 3. Mengekstrak berkas arsip zip..."
unzip -q -o "$ZIP_PATH" -d "$SDK_DIR/cmdline-tools"

echo "==> 4. Menyusun struktur folder SDK (cmdline-tools/latest)..."
rm -rf "$SDK_DIR/cmdline-tools/latest"
mv "$SDK_DIR/cmdline-tools/cmdline-tools" "$SDK_DIR/cmdline-tools/latest"

echo "==> 5. Menerima seluruh lisensi Android SDK..."
yes | "$SDK_DIR/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$SDK_DIR" --licenses

echo "==> 6. Memasang Platform-tools, SDK Platform 34, & Build-tools..."
"$SDK_DIR/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$SDK_DIR" \
  "platform-tools" \
  "platforms;android-34" \
  "build-tools;34.0.0"

echo "==> 7. Mengonfigurasi berkas local.properties proyek..."
echo "sdk.dir=$SDK_DIR" > /home/tegoeh/cozy-dashboard/android/local.properties

echo "=================================================================="
echo "   SUKSES: Android SDK (API 34) Berhasil Terpasang & Dikonfigurasi! "
echo "=================================================================="
rm -f "$ZIP_PATH"
