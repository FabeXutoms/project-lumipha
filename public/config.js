// config.js - Merkezi API Yapılandırması
// IP değişirse sadece bu dosyayı güncelle!

const CONFIG = {
    // Production sunucu adresi
    API_BASE_URL: 'http://130.61.108.198:3000',
    
    // Geliştirme ortamı için:
    // API_BASE_URL: 'http://localhost:3000',
};

// Global olarak erişilebilir yap
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
