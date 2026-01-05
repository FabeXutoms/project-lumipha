// config.js - Admin Paneli API Yapılandırması
const CONFIG = {
    // Canlı Sunucu (Varsayılan)
    // Eğer localhost'ta test yapıyorsanız alttaki satırı yorumdan çıkarın, üsttekini yorumlayın.

    API_BASE_URL: 'https://www.lumipha.com',

    // Geliştirme Ortamı (Localhost)
    // API_BASE_URL: 'http://localhost:3000',
};

// Global olarak erişilebilir yap
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
