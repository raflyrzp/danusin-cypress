import { StoreService } from "../../../danusin-backend/src/modules/stores/store.service";
import { AppError } from "../../../danusin-backend/src/core/middlewares/error.middleware";

jest.mock("../../../danusin-backend/src/core/config/database.config.js", () => ({
  prisma: {
    $transaction: jest.fn((callback) => callback(require("../../../danusin-backend/src/core/config/database.config.js").prisma)),
    store: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    user: { update: jest.fn() },
  },
}));

jest.mock("../../../danusin-backend/src/shared/utils/jwt.util.js", () => ({
  generateToken: jest.fn(() => "mock-token"),
}));

describe("StoreService", () => {
  let storeService: StoreService;
  let prismaMock: any;

  beforeEach(() => {
    storeService = new StoreService();
    prismaMock = require("../../../danusin-backend/src/core/config/database.config.js").prisma;
    jest.clearAllMocks();
  });

  describe("createStore", () => {
    it("Skenario Positif: berhasil membuat toko baru", async () => {
      prismaMock.store.findUnique.mockResolvedValue(null);
      prismaMock.store.create.mockResolvedValue({ id: 1, store_name: "Toko A" });
      prismaMock.user.update.mockResolvedValue({ id: 1, role: "seller" });

      const result = await storeService.createStore(1, { store_name: "Toko A", whatsapp: "08123" });
      expect(result.store_name).toBe("Toko A");
      expect(result.token).toBe("mock-token");
    });

    it("Skenario Negatif: throw error jika user sudah punya toko", async () => {
      prismaMock.store.findUnique.mockResolvedValue({ id: 1 }); // sudah ada toko
      await expect(storeService.createStore(1, { store_name: "Toko A", whatsapp: "08123" })).rejects.toThrow(AppError);
    });
  });
});
