#!/bin/bash
# Script instalasi otomatis JDK 21 portabel untuk build Android
set -euo pipefail

JDK_DIR="/home/tegoeh/java-21"
ZIP_PATH="/tmp/jdk21.tar.gz"

echo "=================================================================="
echo "      MEMULAI SETUP OPENJDK 21 PORTABEL (USER-SPACE)              "
echo "=================================================================="

echo "==> 1. Membuat direktori tujuan JDK 21..."
mkdir -p "$JDK_DIR"

echo "==> 2. Mengunduh Adoptium Temurin OpenJDK 21 resmi..."
wget -q --show-progress "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.2%2B13/OpenJDK21U-jdk_x64_linux_hotspot_21.0.2_13.tar.gz" -O "$ZIP_PATH"

echo "==> 3. Mengekstrak arsip tar.gz..."
tar -xzf "$ZIP_PATH" -C "$JDK_DIR" --strip-components=1

echo "==> 4. Memverifikasi compiler javac JDK 21..."
"$JDK_DIR/bin/javac" -version

echo "=================================================================="
echo "   SUKSES: OpenJDK 21 (dengan compiler) siap digunakan di $JDK_DIR!"
echo "=================================================================="
rm -f "$ZIP_PATH"
