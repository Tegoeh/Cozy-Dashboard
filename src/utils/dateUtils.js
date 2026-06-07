/**
 * Mendapatkan string tanggal YYYY-MM-DD berdasarkan waktu lokal pengguna.
 * @param {Date|string|number} d - Objek Date atau nilai tanggal.
 * @returns {string} Tanggal dalam format YYYY-MM-DD waktu lokal.
 */
export function getLocalDateString(d = new Date()) {
  try {
    const dateObj = d instanceof Date ? d : new Date(d);
    // Jika tanggal tidak valid, kembalikan tanggal hari ini
    if (isNaN(dateObj.getTime())) {
      const today = new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error("Gagal melakukan formatting tanggal lokal:", e);
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }
}
