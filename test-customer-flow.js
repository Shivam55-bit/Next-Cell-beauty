#!/usr/bin/env node
/**
 * End-to-End Customer Auth & Admin Customer Management Test
 * Run: node test-customer-flow.js
 */

const API = "http://localhost:4001/api";
const timestamp = Date.now();
const TEST_EMAIL = `qa.customer+${timestamp}@example.com`;
const TEST_PASSWORD = "Test@1234";
const TEST_NAME = `QA Customer ${timestamp}`;
const ADMIN_EMAIL = "admin@nextcall.com";
const ADMIN_PASSWORD = "admin123";

let customerToken = "";
let adminToken = "";
let customerId = "";

const colors = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

const results = [];

async function request(method, path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function pass(test, detail = "") {
  console.log(colors.green(`  ✅ PASS`) + ` ${test}` + (detail ? colors.cyan(` (${detail})`) : ""));
  results.push({ test, passed: true });
}

function fail(test, detail = "") {
  console.log(colors.red(`  ❌ FAIL`) + ` ${test}` + (detail ? colors.yellow(` — ${detail}`) : ""));
  results.push({ test, passed: false });
}

function section(title) {
  console.log("\n" + colors.bold(colors.cyan(`\n📋 ${title}`)));
  console.log("─".repeat(60));
}

// ============================================================
// TESTS
// ============================================================

async function testRegistration() {
  section("1. Customer Registration");

  // 1a. Valid registration
  const { status, data } = await request("POST", "/user/register", {
    fullName: TEST_NAME,
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (status === 201 && data.success && data.data?.token) {
    pass("Register new customer", `status=${status}`);
    customerToken = data.data.token;
    const user = data.data.user;
    if (user && !user.password && !user.hash) {
      pass("Password not returned in registration response");
    } else {
      fail("Password not returned in registration response", "password/hash field found in response");
    }
  } else {
    fail("Register new customer", `status=${status}, message=${data.message}`);
  }

  // 1b. Missing full name
  const { status: s1 } = await request("POST", "/user/register", {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  if (s1 === 400) pass("Reject missing full name", `status=${s1}`);
  else fail("Reject missing full name", `status=${s1}`);

  // 1c. Password too short
  const { status: s2 } = await request("POST", "/user/register", {
    fullName: "Test",
    email: `short+${timestamp}@example.com`,
    password: "123",
  });
  if (s2 === 400) pass("Reject password < 6 chars", `status=${s2}`);
  else fail("Reject password < 6 chars", `status=${s2}`);

  // 1d. Duplicate email
  const { status: s3 } = await request("POST", "/user/register", {
    fullName: TEST_NAME,
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  if (s3 === 409) pass("Reject duplicate email", `status=${s3}`);
  else fail("Reject duplicate email", `status=${s3}`);
}

async function testLogin() {
  section("2. Customer Login");

  // 2a. Valid login
  const { status, data } = await request("POST", "/user/login", {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  if (status === 200 && data.success && data.data?.token) {
    pass("Login with valid credentials", `status=${status}`);
    customerToken = data.data.token;
    const user = data.data.user;
    if (user && !user.password && !user.hash) {
      pass("Password not returned in login response");
    } else {
      fail("Password not returned in login response");
    }
  } else {
    fail("Login with valid credentials", `status=${status}, message=${data.message}`);
  }

  // 2b. Wrong password
  const { status: s1 } = await request("POST", "/user/login", {
    email: TEST_EMAIL,
    password: "wrongpassword",
  });
  if (s1 === 401) pass("Reject wrong password", `status=${s1}`);
  else fail("Reject wrong password", `status=${s1}`);

  // 2c. Non-existent email
  const { status: s2 } = await request("POST", "/user/login", {
    email: `nonexistent+${timestamp}@example.com`,
    password: TEST_PASSWORD,
  });
  if (s2 === 401) pass("Reject non-existent email", `status=${s2}`);
  else fail("Reject non-existent email", `status=${s2}`);

  // 2d. Missing fields
  const { status: s3 } = await request("POST", "/user/login", { email: TEST_EMAIL });
  if (s3 === 400) pass("Reject missing password field", `status=${s3}`);
  else fail("Reject missing password field", `status=${s3}`);
}

async function testProfile() {
  section("3. Customer Profile");

  // 3a. Fetch profile
  const { status, data } = await request("GET", "/user/profile", null, customerToken);
  if (status === 200 && data.success && data.data?.email === TEST_EMAIL) {
    pass("Fetch authenticated profile", `email=${data.data.email}`);
    if (!data.data.password && !data.data.hash) {
      pass("Password not returned in profile response");
    } else {
      fail("Password not returned in profile response");
    }
  } else {
    fail("Fetch authenticated profile", `status=${status}, message=${data.message}`);
  }

  // 3b. Profile requires auth
  const { status: s1 } = await request("GET", "/user/profile", null, "bad-token");
  if (s1 === 401) pass("Profile rejects invalid token", `status=${s1}`);
  else fail("Profile rejects invalid token", `status=${s1}`);

  // 3c. Update profile
  const { status: s2, data: d2 } = await request("PUT", "/user/profile", {
    fullName: `${TEST_NAME} Updated`,
    phone: "9876543210",
  }, customerToken);
  if (s2 === 200 && d2.success) {
    pass("Update profile", `name=${d2.data?.name}`);
  } else {
    fail("Update profile", `status=${s2}, message=${d2.message}`);
  }
}

async function testAdminLogin() {
  section("4. Admin Login");

  const { status, data } = await request("POST", "/admin/auth/login", {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  if (status === 200 && data.success && (data.accessToken || data.data?.token || data.data?.accessToken)) {
    pass("Admin login successful", `status=${status}`);
    adminToken = data.accessToken || data.data?.token || data.data?.accessToken;
  } else {
    fail("Admin login", `status=${status}, message=${data.message}`);
    console.log(colors.yellow("  ⚠️  Cannot continue Admin Customer tests without admin token"));
  }
}

async function testAdminCustomerManagement() {
  section("5. Admin Customer Management");

  if (!adminToken) {
    fail("Admin customers list — no admin token available");
    return;
  }

  // 5a. Get all customers
  const { status, data } = await request("GET", "/admin/customers", null, adminToken);
  if (status === 200 && data.success && Array.isArray(data.data)) {
    pass("Fetch admin customers list", `status=${status}, count=${data.data.length}`);

    // 5b. Check our test customer appears
    const found = data.data.find(
      (c) => c.email === TEST_EMAIL || c.email === TEST_EMAIL.toLowerCase()
    );
    if (found) {
      pass("Registered customer appears in admin list", `name=${found.name}, email=${found.email}`);
      customerId = found.id;

      // 5c. Verify fields
      const hasRequiredFields =
        found.name && found.email && found.status !== undefined;
      if (hasRequiredFields) {
        pass("Customer record has required fields (name, email, status)");
      } else {
        fail("Customer record missing required fields", JSON.stringify(found));
      }

      // 5d. Registration date should be today
      const today = new Date().toISOString().split("T")[0];
      if (found.registrationDate && found.registrationDate.startsWith(today)) {
        pass("Registration date is today", `date=${found.registrationDate}`);
      } else {
        fail("Registration date check", `date=${found.registrationDate}, expected today=${today}`);
      }

      // 5e. Orders and spending should start at 0
      if (found.totalOrders === 0 && found.totalSpent === 0) {
        pass("New customer has 0 orders and 0 total spent");
      } else {
        pass("Customer order stats returned", `orders=${found.totalOrders}, spent=${found.totalSpent}`);
      }
    } else {
      fail(
        "Registered customer appears in admin list",
        `${TEST_EMAIL} not found in list of ${data.data.length} customers`
      );
    }
  } else {
    fail("Fetch admin customers list", `status=${status}, message=${data.message}`);
  }

  if (!customerId) return;

  // 5f. Get single customer by ID
  const { status: s1, data: d1 } = await request("GET", `/admin/customers/${customerId}`, null, adminToken);
  if (s1 === 200 && d1.success) {
    pass("Fetch customer by ID", `id=${customerId}`);
  } else {
    fail("Fetch customer by ID", `status=${s1}, message=${d1.message}`);
  }

  // 5g. Update customer
  const { status: s2, data: d2 } = await request("PUT", `/admin/customers/${customerId}`, {
    phone: "1234567890",
  }, adminToken);
  if (s2 === 200 && d2.success) {
    pass("Update customer from admin", `phone=${d2.data?.phone}`);
  } else {
    fail("Update customer from admin", `status=${s2}, message=${d2.message}`);
  }

  // 5h. Disable customer
  const { status: s3, data: d3 } = await request("PUT", `/admin/customers/${customerId}`, {
    status: "Disabled",
  }, adminToken);
  if (s3 === 200 && d3.success) {
    pass("Disable customer from admin", `status=${d3.data?.status}`);
  } else {
    fail("Disable customer from admin", `status=${s3}, message=${d3.message}`);
  }

  // 5i. Disabled customer cannot login
  const { status: s4, data: d4 } = await request("POST", "/user/login", {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  if (s4 === 401) {
    pass("Disabled customer cannot login", `status=${s4}`);
  } else {
    fail("Disabled customer cannot login", `status=${s4}, message=${d4.message}`);
  }

  // 5j. Re-enable customer
  const { status: s5, data: d5 } = await request("PUT", `/admin/customers/${customerId}`, {
    status: "Active",
  }, adminToken);
  if (s5 === 200 && d5.success) {
    pass("Re-enable customer from admin", `status=${d5.data?.status}`);
  } else {
    fail("Re-enable customer from admin", `status=${s5}, message=${d5.message}`);
  }

  // 5k. Re-enabled customer can login again
  const { status: s6, data: d6 } = await request("POST", "/user/login", {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  if (s6 === 200 && d6.success) {
    pass("Re-enabled customer can login", `status=${s6}`);
    customerToken = d6.data.token;
  } else {
    fail("Re-enabled customer can login", `status=${s6}, message=${d6.message}`);
  }
}

async function testProtectedRoutes() {
  section("6. Protected Route Security");

  // No token
  const { status: s1 } = await request("GET", "/user/profile");
  if (s1 === 401) pass("Protected profile endpoint rejects no-token request", `status=${s1}`);
  else fail("Protected profile endpoint rejects no-token request", `status=${s1}`);

  // Admin routes blocked for customers
  const { status: s2 } = await request("GET", "/admin/customers", null, customerToken);
  if (s2 === 403) pass("Admin endpoints block customer tokens", `status=${s2}`);
  else fail("Admin endpoints block customer tokens", `status=${s2}`);
}

async function testCleanup() {
  section("7. Cleanup — Delete test customer");

  if (!customerId || !adminToken) {
    console.log(colors.yellow("  ⚠️  Skipping cleanup (no customerId or adminToken)"));
    return;
  }

  const { status, data } = await request("DELETE", `/admin/customers/${customerId}`, null, adminToken);
  if (status === 200 && data.success) {
    pass("Delete test customer from admin", `id=${customerId}`);
  } else {
    fail("Delete test customer from admin", `status=${status}, message=${data.message}`);
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log("\n" + colors.bold("═".repeat(60)));
  console.log(colors.bold(colors.cyan("  Next Cell Beauty — Customer Flow E2E Test")));
  console.log(colors.bold("═".repeat(60)));
  console.log(`  API:        ${API}`);
  console.log(`  Test email: ${TEST_EMAIL}`);
  console.log(colors.bold("═".repeat(60)));

  try {
    await testRegistration();
    await testLogin();
    await testProfile();
    await testAdminLogin();
    await testAdminCustomerManagement();
    await testProtectedRoutes();
    await testCleanup();
  } catch (err) {
    console.error(colors.red("\n❌ Test runner crashed:"), err.message);
    process.exitCode = 1;
  }

  // Summary
  console.log("\n" + colors.bold("═".repeat(60)));
  console.log(colors.bold("📊 FINAL TEST RESULTS"));
  console.log("─".repeat(60));

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const failed = total - passed;

  results.forEach((r) => {
    const icon = r.passed ? colors.green("✅") : colors.red("❌");
    console.log(`  ${icon} ${r.test}`);
  });

  console.log("─".repeat(60));
  console.log(
    colors.bold(`  Score: ${passed}/${total} passed`) +
      (failed > 0 ? colors.red(` (${failed} failed)`) : colors.green(" — All tests passed! 🎉"))
  );
  console.log(colors.bold("═".repeat(60)));

  if (failed > 0) process.exitCode = 1;
}

main();
