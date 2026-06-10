// Utilitaire pour tester la connexion à l'API

export const testApiConnection = async () => {
  const API_URL = import.meta.env.VITE_API_URL || 'https://lotus-business-server.onrender.com/api';
  
  console.log('🧪 Test de connexion API...');
  console.log('📍 URL:', API_URL);
  
  try {
    // Test 1: Root de l'API
    const rootResponse = await fetch(API_URL.replace('/api', ''));
    const rootData = await rootResponse.json();
    console.log('✅ Root API:', rootData);
    
    // Test 2: Endpoint admin/login avec POST
    const loginResponse = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('📡 Login endpoint status:', loginResponse.status);
    console.log('📡 Login response:', loginData);
    
    return {
      success: true,
      apiWorking: rootResponse.ok,
      loginEndpointWorking: loginResponse.status === 401 || loginResponse.status === 400, // Ces codes signifient que l'endpoint existe
    };
  } catch (error) {
    console.error('❌ Erreur test API:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Pour utiliser dans la console du navigateur
window.testApiConnection = testApiConnection;
