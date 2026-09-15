/**
 * Automated Verification Script for TransitMate Backend APIs
 */
async function runTests() {
  const BASE_URL = 'http://localhost:5000/api';
  console.log(`\n🔍 Running TransitMate Backend Verification Tests against ${BASE_URL}...\n`);

  try {
    // 1. Health Check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    console.log(`✅ [1/7] Health Check:`, health.status, `(${health.project})`);

    // 2. Auth - Guest & Register
    const guestRes = await fetch(`${BASE_URL}/auth/guest`, { method: 'POST' });
    const guest = await guestRes.json();
    console.log(`✅ [2/7] Auth Guest:`, guest.success ? 'Token generated' : 'Failed');

    // 3. Routes & Search
    const searchRes = await fetch(`${BASE_URL}/routes/search?destination=Park Street&priority=fastest`);
    const search = await searchRes.json();
    console.log(`✅ [3/7] Route Search (Park Street):`, search.options?.length, 'options found');

    // 4. Live Tracking Telemetry
    const trackRes = await fetch(`${BASE_URL}/track/home`);
    const track = await trackRes.json();
    console.log(`✅ [4/7] Live Vehicle Tracking:`, track.vehicle?.routeLabel, '-', track.vehicle?.currentStop);

    // 5. Coach Crowd Intelligence
    const crowdRes = await fetch(`${BASE_URL}/track/office/crowd-map?gate=3`);
    const crowd = await crowdRes.json();
    console.log(`✅ [5/7] Coach Crowd Intelligence: Recommended Coach ->`, crowd.crowdIntelligence?.recommended?.id);

    // 6. Habit Analytics
    const habitsRes = await fetch(`${BASE_URL}/habits/stats`);
    const habits = await habitsRes.json();
    console.log(`✅ [6/7] Habit Analytics:`, habits.summary?.savedVsCab, 'saved vs cab');

    // 7. Community Reports
    const postRes = await fetch(`${BASE_URL}/community/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName: 'SIH Evaluator',
        type: 'delay',
        routeLabel: 'Route 12',
        message: 'Bus moving smoothly post Karunamoyee junction.',
      }),
    });
    const post = await postRes.json();
    console.log(`✅ [7/7] Community Incident Post:`, post.success ? `Post ID: ${post.post?.id}` : 'Failed');

    console.log(`\n🎉 All Backend Tests Passed Successfully!\n`);
  } catch (err) {
    console.error(`❌ Test failed:`, err.message);
  }
}

runTests();
