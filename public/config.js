// config.js - Merkezi API Yapılandırması
// IP değişirse sadece bu dosyayı güncelle!

const CONFIG = {
    // Production sunucu adresi - Relative path kullanıyoruz (CORS sorunu olmaz)
    // Aynı domain üzerinden servis edildiği için boş string yeterli
    API_BASE_URL: '',
    
    // Geliştirme ortamı için:
    // API_BASE_URL: 'http://localhost:3000',
};

// Global olarak erişilebilir yap
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
