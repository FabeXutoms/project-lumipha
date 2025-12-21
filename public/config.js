// config.js - Merkezi API Yapılandırması
// IP değişirse sadece bu dosyayı güncelle!

const CONFIG = {
    // Production sunucu adresi (Cloudflare + Nginx ile HTTPS)
    API_BASE_URL: 'https://lumipha.com',
    
    // Geliştirme ortamı için:
    // API_BASE_URL: 'http://localhost:3000',
};

// Global olarak erişilebilir yap
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
