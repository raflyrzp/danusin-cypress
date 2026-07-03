import { UserService } from "../../../danusin-backend/src/modules/users/user.service";
import { AppError } from "../../../danusin-backend/src/core/middlewares/error.middleware";
import * as bcryptUtil from "../../../danusin-backend/src/shared/utils/bcrypt.util";

jest.mock("../../../danusin-backend/src/core/config/database.config.js", () => ({
  prisma: {
    $transaction: jest.fn((callback) => callback(require("../../../danusin-backend/src/core/config/database.config.js").prisma)),
    user: { findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    image: { findFirst: jest.fn(), update: jest.fn(), create: jest.fn(), findMany: jest.fn() },
    order: { findMany: jest.fn(), count: jest.fn() },
    store: { findUnique: jest.fn(), create: jest.fn() },
  },
}));

jest.mock("../../../danusin-backend/src/shared/utils/bcrypt.util.js", () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

describe("UserService", () => {
  let userService: UserService;
  let prismaMock: any;

  beforeEach(() => {
    userService = new UserService();
    prismaMock = require("../../../danusin-backend/src/core/config/database.config.js").prisma;
    jest.clearAllMocks();
  });

  describe("updateEmail", () => {
    it("Skenario Positif: berhasil merubah email jika password benar", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ password: "hashed" });
      (bcryptUtil.comparePassword as jest.Mock).mockResolvedValue(true);
      prismaMock.user.findFirst.mockResolvedValue(null); // Email blm dipakai

      const result = await userService.updateEmail(1, "new@test.com", "pass");
      expect(result.message).toBe("Email berhasil diperbarui");
      expect(prismaMock.user.update).toHaveBeenCalled();
    });

    it("Skenario Negatif: throw error jika password salah", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ password: "hashed" });
      (bcryptUtil.comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(userService.updateEmail(1, "new@test.com", "wrong")).rejects.toThrow(AppError);
    });
  });

  describe("getMyProfile", () => {
    it("Skenario Batas: email dan phone ter-mask dengan benar", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        email: "contoh@domain.com",
        whatsapp: "081234567890",
      });
      prismaMock.image.findFirst.mockResolvedValue(null);

      const result = await userService.getMyProfile(1);
      
      expect(result.email).toBe("c*****@domain.com"); // Masking email lokal
      expect(result.whatsapp).toBe("0812******90"); // Masking nomor whatsapp
    });
  });
});
