const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/bet-results';

// Mock JWT token (you'll need to get a real one from your auth system)
const mockToken = 'your_jwt_token_here';

async function testBetResultsAPI() {
  console.log('🧪 Testing Bet Results API...\n');

  try {
    // Test 1: Get all bet results
    console.log('1. Testing GET /bet-results');
    const allResultsResponse = await axios.get(`${BASE_URL}`);
    console.log('✅ Success:', allResultsResponse.data.message);
    console.log('   Total results:', allResultsResponse.data.pagination?.total || 0);
    console.log('   Current page count:', allResultsResponse.data.count);
    console.log('');

    // Test 2: Get bet results with filtering
    console.log('2. Testing GET /bet-results with filters');
    const filteredResponse = await axios.get(`${BASE_URL}?limit=5&sortBy=createdAt&sortOrder=desc`);
    console.log('✅ Success:', filteredResponse.data.message);
    console.log('   Filtered results count:', filteredResponse.data.count);
    console.log('   Has more results:', filteredResponse.data.pagination?.hasMore);
    console.log('');

    // Test 3: Get bet result statistics
    console.log('3. Testing GET /bet-results/stats');
    const statsResponse = await axios.get(`${BASE_URL}/stats`);
    console.log('✅ Success:', statsResponse.data.message);
    console.log('   Statistics:', JSON.stringify(statsResponse.data.data, null, 2));
    console.log('');

    // Test 4: Get recent bet results
    console.log('4. Testing GET /bet-results/recent');
    const recentResponse = await axios.get(`${BASE_URL}/recent?limit=10`);
    console.log('✅ Success:', recentResponse.data.message);
    console.log('   Recent results count:', recentResponse.data.count);
    console.log('');

    // Test 5: Get bet results by status
    console.log('5. Testing GET /bet-results/status/win');
    const statusResponse = await axios.get(`${BASE_URL}/status/win?limit=5`);
    console.log('✅ Success:', statusResponse.data.message);
    console.log('   Win results count:', statusResponse.data.count);
    console.log('');

    // Test 6: Get bet results by game
    console.log('6. Testing GET /bet-results/game/1');
    const gameResponse = await axios.get(`${BASE_URL}/game/1?limit=5`);
    console.log('✅ Success:', gameResponse.data.message);
    console.log('   Game results count:', gameResponse.data.count);
    console.log('');

    // Test 7: Get bet result by ID
    if (allResultsResponse.data.data.length > 0) {
      const firstResultId = allResultsResponse.data.data[0].id;
      console.log(`7. Testing GET /bet-results/${firstResultId}`);
      const byIdResponse = await axios.get(`${BASE_URL}/${firstResultId}`);
      console.log('✅ Success:', byIdResponse.data.message);
      console.log('   Result ID:', byIdResponse.data.data.id);
      console.log('   Game Name:', byIdResponse.data.data.gameName);
      console.log('   Provider Details:', byIdResponse.data.data.providerDetails ? 'Available' : 'Not available');
      console.log('');
    }

    // Test 8: Get bet results by user (requires authentication)
    console.log('8. Testing GET /bet-results/user/1 (requires valid JWT token)');
    try {
      const userResponse = await axios.get(`${BASE_URL}/user/1`, {
        headers: { Authorization: `Bearer ${mockToken}` }
      });
      console.log('✅ Success:', userResponse.data.message);
      console.log('   User results count:', userResponse.data.count);
    } catch (error) {
      console.log('❌ Expected error (invalid token):', error.response?.data?.message || error.message);
    }
    console.log('');

    // Test 9: Advanced filtering
    console.log('9. Testing advanced filtering');
    const advancedFilterResponse = await axios.get(`${BASE_URL}?limit=3&sortBy=betAmount&sortOrder=desc`);
    console.log('✅ Success:', advancedFilterResponse.data.message);
    console.log('   Advanced filtered results count:', advancedFilterResponse.data.count);
    console.log('   Applied filters:', JSON.stringify(advancedFilterResponse.data.filters, null, 2));
    console.log('');

    // Test 10: Check data structure
    if (allResultsResponse.data.data.length > 0) {
      console.log('10. Checking data structure');
      const sampleResult = allResultsResponse.data.data[0];
      console.log('✅ Sample result structure:');
      console.log('   - Has gameDetails:', !!sampleResult.gameDetails);
      console.log('   - Has providerDetails:', !!sampleResult.providerDetails);
      console.log('   - Game Name:', sampleResult.gameName);
      console.log('   - Provider Info (JSON):', sampleResult.gameProvider ? 'Available' : 'Not available');
      
      // Try to parse provider info
      if (sampleResult.gameProvider) {
        try {
          const providerInfo = JSON.parse(sampleResult.gameProvider);
          console.log('   - Parsed Provider Name:', providerInfo.name || 'N/A');
          console.log('   - Provider ID:', providerInfo.id || 'N/A');
        } catch (error) {
          console.log('   - Provider Info parsing failed:', error.message);
        }
      }
      console.log('');
    }

    console.log('🎉 Bet Results API tests completed!');
    console.log('');
    console.log('📝 Note: Some endpoints require valid JWT authentication.');
    console.log('   To test protected endpoints, get a valid token from your auth system.');
    console.log('');
    console.log('🔍 Available Filtering Options:');
    console.log('   - userId, gameId, betStatus, playingStatus');
    console.log('   - dateFrom, dateTo, minBetAmount, maxBetAmount');
    console.log('   - gameName, providerName, isMobile');
    console.log('   - limit, offset, sortBy, sortOrder');
    console.log('');
    console.log('📊 Sample Queries:');
    console.log('   GET /bet-results?userId=1&betStatus=win&limit=10');
    console.log('   GET /bet-results?dateFrom=2024-01-01T00:00:00.000Z&sortBy=betAmount');
    console.log('   GET /bet-results?gameName=Slot&isMobile=false');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
testBetResultsAPI();

