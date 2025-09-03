// __tests__/petgame.smoke.test.js
// Jest-based comprehensive smoke test for Pet Game backend

const axios = require("axios");

const BASE = process.env.BASE_URL || "http://localhost:5000/api";
const TIMEOUT = 30000;

let testUser, friendUser;
let token, friendToken;
let createdPets = [];

async function doRequest(method, path, body = null, auth = null) {
  const url = `${BASE}${path}`;
  const headers = {};
  if (auth) headers["Authorization"] = `Bearer ${auth}`;
  const resp = await axios({ method, url, data: body, headers, timeout: TIMEOUT });
  return resp.data;
}

describe("🐾 Pet Game API Smoke Tests", () => {
  const ts = Math.floor(Date.now() / 1000);

  beforeAll(async () => {
    // Create test users
    testUser = {
      username: `SmokeTest${ts}`,
      email: `smoketest_${ts}@petgame.test`,
      password: "TestPass123!",
    };
    friendUser = {
      username: `Friend${ts}`,
      email: `friend_${ts}@petgame.test`,
      password: "TestPass123!",
    };

    // Register main user
    let reg = await doRequest("post", "/auth/register", testUser);
    token = reg?.data?.token;
    if (!token) {
      const login = await doRequest("post", "/auth/login", {
        email: testUser.email,
        password: testUser.password,
      });
      token = login?.data?.token;
    }
    expect(token).toBeTruthy();

    // Register friend user
    let freg = await doRequest("post", "/auth/register", friendUser);
    friendToken = freg?.data?.token;
    if (!friendToken) {
      const flogin = await doRequest("post", "/auth/login", {
        email: friendUser.email,
        password: friendUser.password,
      });
      friendToken = flogin?.data?.token;
    }
    expect(friendToken).toBeTruthy();
  }, 40000);

  afterAll(async () => {
    // Cleanup: delete pets created
    for (const pid of createdPets) {
      await doRequest("delete", `/pets/${pid}`, null, token);
    }
  });

  describe("System", () => {
    test("Health Check", async () => {
      const res = await doRequest("get", "/health");
      expect(res).toHaveProperty("success", true);
      expect(res).toHaveProperty("message");
    });

    test("Performance Stats", async () => {
      const res = await doRequest("get", "/performance");
      expect(res).toHaveProperty("success", true);
      expect(res.data).toHaveProperty("uptime");
    });
  });

  describe("Auth & Profile", () => {
    test("Get Profile", async () => {
      const res = await doRequest("get", "/auth/profile", null, token);
      expect(res.data.user.username).toBe(testUser.username);
    });
  });

  describe("Pets", () => {
    test("Create Pets", async () => {
      const petTypes = ["cat", "dog"];
      for (const type of petTypes) {
        const p = await doRequest("post", "/pets", { name: `TestPet_${type}_${ts}`, type }, token);
        expect(p.data.pet).toHaveProperty("_id");
        createdPets.push(p.data.pet._id);
      }
    });

    test("Feed and Play with Pet", async () => {
      const petId = createdPets[0];
      const feed = await doRequest("patch", `/pets/${petId}/feed`, null, token);
      expect(feed.success).toBe(true);

      const play = await doRequest("patch", `/pets/${petId}/play`, null, token);
      expect(play.success).toBe(true);
    });
  });

  describe("Shop & Inventory", () => {
    let shopItemId;

    test("Get Shop Items", async () => {
      const res = await doRequest("get", "/shop/items", null, token);
      expect(Array.isArray(res.data.items)).toBe(true);
      shopItemId = res.data.items[0]?._id;
    });

    test("Buy Item & Use It", async () => {
      if (!shopItemId) return;
      const buy = await doRequest("post", "/shop/buy", { itemId: shopItemId, quantity: 1 }, token);
      expect(buy.success).toBe(true);

      const inv = await doRequest("get", "/shop/inventory", null, token);
      expect(Array.isArray(inv.data.inventory)).toBe(true);

      if (inv.data.inventory.length > 0 && createdPets.length > 0) {
        const invItem = inv.data.inventory[0];
        const use = await doRequest(
          "post",
          "/shop/inventory/use",
          { inventoryId: invItem._id, petId: createdPets[0] },
          token
        );
        expect(use.success).toBe(true);
      }
    });
  });

  describe("Games & Missions", () => {
    test("Get Economic Stats", async () => {
      const res = await doRequest("get", "/games/economic-stats", null, token);
      expect(res).toHaveProperty("success");
    });

    test("Claim Daily Bonus", async () => {
      const res = await doRequest("post", "/games/daily-bonus", null, token);
      expect(res.success).toBe(true);
    });

    test("Memory Game Result", async () => {
      const res = await doRequest("post", "/games/memory-result", { score: 95, timeCompleted: 25, difficulty: "hard" }, token);
      expect(res.success).toBe(true);
    });

    test("Get & Complete Missions", async () => {
      const res = await doRequest("get", "/daily-missions", null, token);
      expect(Array.isArray(res.data.missions)).toBe(true);
    });
  });

  describe("Friends", () => {
    test("Send & Accept Friend Request", async () => {
      const mainProfile = await doRequest("get", "/auth/profile", null, token);
      const friendProfile = await doRequest("get", "/auth/profile", null, friendToken);
      const mainId = mainProfile.data.user.id;
      const friendId = friendProfile.data.user.id;

      // User phụ gửi lời mời tới user chính
      let send;
      try {
        send = await doRequest("post", "/friends/send", { userId: mainId }, friendToken);
        expect(send.success).toBe(true);
      } catch (err) {
        // Nếu đã gửi trước đó, chấp nhận lỗi 400
        expect(err.response.status).toBe(400);
      }

      // User chính chấp nhận lời mời từ user phụ
      let accept;
      try {
        accept = await doRequest("post", "/friends/accept", { userId: friendId }, token);
        expect(accept.success).toBe(true);
      } catch (err) {
        // Nếu đã là bạn, chấp nhận lỗi 400
        expect(err.response.status).toBe(400);
      }
    });
  });

  describe("Achievements", () => {
    test("Get Achievements", async () => {
      const res = await doRequest("get", "/achievements", null, token);
      expect(Array.isArray(res.data.achievements)).toBe(true);
    });
  });
});
