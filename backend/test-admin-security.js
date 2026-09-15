import http from 'http';

function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, 'http://localhost:5000');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const body = data ? JSON.stringify(data) : null;
    if (body) headers['Content-Length'] = Buffer.byteLength(body);

    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        headers,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode, body: raw });
          }
        });
      }
    );

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function runSecurityTests() {
  console.log('====================================================');
  console.log('  🛡️ Running Strict Admin Security & RBAC Test Suite');
  console.log('====================================================\n');

  // Test 1: Unauthenticated request to /api/admin/metrics must fail (401)
  const unauthRes = await makeRequest('/api/admin/metrics');
  console.log(`Test 1 [Unauthenticated /api/admin/metrics]: HTTP ${unauthRes.status}`);
  if (unauthRes.status === 401) {
    console.log('  ✅ PASSED: Blocked unauthenticated access.\n');
  } else {
    console.log('  ❌ FAILED: Did not block unauthenticated access.\n');
  }

  // Test 2: Commuter login and attempt to access /api/admin/metrics must fail (403)
  const commuterAuth = await makeRequest('/api/auth/login', 'POST', {
    email: 'rhea@example.com',
    password: 'password123',
  });
  const commuterToken = commuterAuth.body.token;

  const commuterAdminAttempt = await makeRequest('/api/admin/metrics', 'GET', null, commuterToken);
  console.log(`Test 2 [Commuter Token /api/admin/metrics]: HTTP ${commuterAdminAttempt.status}`);
  if (commuterAdminAttempt.status === 403) {
    console.log('  ✅ PASSED: Blocked regular commuter from accessing Admin.\n');
  } else {
    console.log('  ❌ FAILED: Allowed commuter to access Admin.\n');
  }

  // Test 3: Admin login with unique credentials must succeed (200)
  const adminAuth = await makeRequest('/api/auth/admin-login', 'POST', {
    email: 'transitmate.sih.admin@gmail.com',
    password: 'TransitAdmin#2026!SIH',
  });
  console.log(`Test 3 [Admin Login]: HTTP ${adminAuth.status} - ${adminAuth.body.message}`);
  const adminToken = adminAuth.body.token;

  if (adminAuth.status === 200 && adminToken) {
    console.log('  ✅ PASSED: Admin authenticated successfully.\n');
  } else {
    console.log('  ❌ FAILED: Admin login failed.\n');
  }

  // Test 4: Admin calling /api/admin/metrics must succeed (200)
  const adminMetrics = await makeRequest('/api/admin/metrics', 'GET', null, adminToken);
  console.log(`Test 4 [Admin calling /api/admin/metrics]: HTTP ${adminMetrics.status} - Active Fleet: ${adminMetrics.body.activeFleetCount}`);
  if (adminMetrics.status === 200) {
    console.log('  ✅ PASSED: Admin granted access to live telemetry.\n');
  } else {
    console.log('  ❌ FAILED: Admin access denied.\n');
  }

  console.log('====================================================');
  console.log('  🎉 All Admin Role-Based Security Tests Completed!');
  console.log('====================================================');
}

runSecurityTests();
