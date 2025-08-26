// Test Game Statistics API Endpoints
// Run with: node test-game-stats-api.js

const BASE_URL = 'http://localhost:3000';

// You'll need to replace this with a valid JWT token
const JWT_TOKEN = 'YOUR_JWT_TOKEN_HERE';

async function testGameStatsAPI() {
  try {
    console.log('🧪 Testing Game Statistics API...\n');
    
    // Test without authentication (should fail)
    console.log('1. Testing without authentication (should fail):');
    const response1 = await fetch(`${BASE_URL}/api/game-stats`);
    console.log(`   Status: ${response1.status}`);
    const data1 = await response1.json();
    console.log(`   Response: ${JSON.stringify(data1, null, 2)}\n`);
    
    // Test with authentication
    if (JWT_TOKEN !== 'YOUR_JWT_TOKEN_HERE') {
      console.log('2. Testing game statistics with authentication:');
      
      // Test basic game stats
      const response2 = await fetch(`${BASE_URL}/api/game-stats?limit=5&sortBy=totalBets&sortOrder=desc`, {
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`   Status: ${response2.status}`);
      const data2 = await response2.json();
      
      if (data2.success) {
        console.log(`   ✅ Successfully fetched ${data2.data.length} games`);
        console.log(`   📊 Summary: ${data2.summary.totalGames} total games, ${data2.summary.totalBets} total bets`);
        
        if (data2.data.length > 0) {
          const firstGame = data2.data[0];
          console.log(`   🎮 First game: ${firstGame.gameName}`);
          console.log(`   💰 Total bet amount: ${firstGame.totalBetAmount}`);
          console.log(`   🏆 Win rate: ${firstGame.winRate}%`);
          console.log(`   👥 Players played: ${firstGame.totalPlayersPlayed}`);
        }
      } else {
        console.log(`   ❌ Failed: ${data2.message}`);
      }
      
      console.log('\n3. Testing specific game statistics:');
      if (data2.success && data2.data.length > 0) {
        const gameId = data2.data[0].gameId;
        const response3 = await fetch(`${BASE_URL}/api/game-stats/${gameId}`, {
          headers: {
            'Authorization': `Bearer ${JWT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`   Status: ${response3.status}`);
        const data3 = await response3.json();
        
        if (data3.success) {
          console.log(`   ✅ Successfully fetched stats for game ID: ${gameId}`);
          console.log(`   🎮 Game: ${data3.data.gameName}`);
          console.log(`   📈 Total bets: ${data3.data.totalBets}`);
          console.log(`   💰 Total bet amount: ${data3.data.totalBetAmount}`);
          console.log(`   🏆 Win rate: ${data3.data.winRate}%`);
        } else {
          console.log(`   ❌ Failed: ${data3.message}`);
        }
      }
      
      console.log('\n4. Testing filtered game statistics:');
      const response4 = await fetch(`${BASE_URL}/api/game-stats?limit=3&sortBy=winRate&sortOrder=desc`, {
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`   Status: ${response4.status}`);
      const data4 = await response4.json();
      
      if (data4.success) {
        console.log(`   ✅ Successfully fetched top 3 games by win rate`);
        data4.data.forEach((game, index) => {
          console.log(`   ${index + 1}. ${game.gameName} - Win Rate: ${game.winRate}%`);
        });
      } else {
        console.log(`   ❌ Failed: ${data4.message}`);
      }
      
    } else {
      console.log('2. Skipping authenticated tests - please set JWT_TOKEN');
      console.log('   To get a token, login through your authentication endpoint');
    }
    
  } catch (error) {
    console.error('❌ Error testing Game Statistics API:', error.message);
  }
}

// Test the endpoints
testGameStatsAPI();

console.log('\n📝 Usage Instructions:');
console.log('1. Make sure your server is running on port 3000');
console.log('2. Replace JWT_TOKEN with a valid token from your auth system');
console.log('3. Run: node test-game-stats-api.js');
console.log('4. Check the console output for results');
console.log('\n🔗 Available Endpoints:');
console.log('   GET /api/game-stats - Get all game statistics with filtering');
console.log('   GET /api/game-stats/:gameId - Get statistics for specific game');
console.log('\n📊 Sample Queries:');
console.log('   /api/game-stats?limit=10&sortBy=totalBetAmount&sortOrder=desc');
console.log('   /api/game-stats?dateFrom=2024-01-01&dateTo=2024-01-31');
console.log('   /api/game-stats?status=active&sortBy=winRate&sortOrder=desc');
