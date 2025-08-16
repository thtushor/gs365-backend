const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/games';

// Test data
const testData = {
  userId: 1,
  gameId: 1,
  betAmount: 100.00,
  userScore: 1500,
  ipAddress: '127.0.0.1',
  deviceInfo: 'Test Device'
};

// Mock JWT token (you'll need to get a real one from your auth system)
const mockToken = 'your_jwt_token_here';

async function testGamingAPI() {
  console.log('🧪 Testing Gaming API...\n');

  try {
    // Test 1: Get all games
    console.log('1. Testing GET /games');
    const gamesResponse = await axios.get(`${BASE_URL}/games`);
    console.log('✅ Success:', gamesResponse.data.message);
    console.log('   Games count:', gamesResponse.data.count);
    console.log('');

    // Test 2: Get games by category
    console.log('2. Testing GET /games/category/Slots');
    const categoryResponse = await axios.get(`${BASE_URL}/games/category/Slots`);
    console.log('✅ Success:', categoryResponse.data.message);
    console.log('   Games in category:', categoryResponse.data.count);
    console.log('');

    // Test 3: Get favorite games
    console.log('3. Testing GET /games/favorites');
    const favoritesResponse = await axios.get(`${BASE_URL}/games/favorites`);
    console.log('✅ Success:', favoritesResponse.data.message);
    console.log('   Favorite games:', favoritesResponse.data.count);
    console.log('');

    // Test 4: Get game stats
    console.log('4. Testing GET /games/1/stats');
    const statsResponse = await axios.get(`${BASE_URL}/games/1/stats`);
    console.log('✅ Success:', statsResponse.data.message);
    console.log('   Game stats:', JSON.stringify(statsResponse.data.data, null, 2));
    console.log('');

    // Test 5: Play game (requires authentication)
    console.log('5. Testing POST /play (requires valid JWT token)');
    try {
      const playResponse = await axios.post(`${BASE_URL}/play`, testData, {
        headers: { Authorization: `Bearer ${mockToken}` }
      });
      console.log('✅ Success:', playResponse.data.message);
      console.log('   Session token:', playResponse.data.data.sessionToken.substring(0, 50) + '...');
    } catch (error) {
      console.log('❌ Expected error (invalid token):', error.response?.data?.message || error.message);
    }
    console.log('');

    // Test 6: Get user bet history (requires authentication)
    console.log('6. Testing GET /user/1/bet-history (requires valid JWT token)');
    try {
      const historyResponse = await axios.get(`${BASE_URL}/user/1/bet-history`, {
        headers: { Authorization: `Bearer ${mockToken}` }
      });
      console.log('✅ Success:', historyResponse.data.message);
      console.log('   Bet history count:', historyResponse.data.count);
    } catch (error) {
      console.log('❌ Expected error (invalid token):', error.response?.data?.message || error.message);
    }
    console.log('');

    console.log('🎉 Gaming API tests completed!');
    console.log('');
    console.log('📝 Note: Some endpoints require valid JWT authentication.');
    console.log('   To test protected endpoints, get a valid token from your auth system.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
testGamingAPI();
