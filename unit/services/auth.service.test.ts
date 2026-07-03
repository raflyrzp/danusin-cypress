import { AuthService } from "../../../danusin-backend/src/modules/auth/auth.service";
import * as bcryptUtil from "../../../danusin-backend/src/shared/utils/bcrypt.util";
import { AppError } from "../../../danusin-backend/src/core/middlewares/error.middleware";

// Mocking dependensi
jest.mock("../../../danusin-backend/src/core/config/database.config.js", () => ({
  prisma: {
    $transaction: jest.fn((callback) => callback(require("../../../danusin-backend/src/core/config/database.config.js").prisma)),
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("../../../danusin-backend/src/shared/utils/bcrypt.util.js", () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

jest.mock("../../../danusin-backend/src/shared/utils/jwt.util.js", () => ({
  generateToken: jest.fn(() => "mock-token"),
}));

describe("AuthService", () => {
  let authService: AuthService;
  let prismaMock: any;

  beforeEach(() => {
    authService = new AuthService();
    prismaMock = require("../../../danusin-backend/src/core/config/database.config.js").prisma;
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("Skenario Positif: harus berhasil melakukan registrasi", async () => {
      // Mocking tidak ada user yang existing
      prismaMock.user.findFirst.mockResolvedValue(null);
      (bcryptUtil.hashPassword as jest.Mock).mockResolvedValue("hashed-pass");
      prismaMock.user.create.mockResolvedValue({ id: 1, nim: "123", email: "a@b.com", password: "hashed-pass", role: "buyer" });

      const result = await authService.register({
        nim: "123",
        email: "a@b.com",
        password: "pass",
        name: "User",
        major: "Informatics",
        faculty: "MIPA",
        batch_year: 2023,
        whatsapp: "08123456789"
      });
      
      // Memastikan properti password tidak direturn
      expect(result).not.toHaveProperty("password");
      expect(result.nim).toBe("123");
    });

    it("Skenario Negatif: harus throw error jika NIM sudah ada", async () => {
      // Mocking user sudah ada
      prismaMock.user.findFirst.mockResolvedValue({ nim: "123", email: "x@b.com" });

      await expect(
        authService.register({
          nim: "123",
          email: "a@b.com",
          password: "pass",
          name: "User",
          major: "Informatics",
          faculty: "MIPA",
          batch_year: 2023,
          whatsapp: "08123456789"
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe("login", () => {
    it("Skenario Positif: harus berhasil login dengan credential valid", async () => {
      prismaMock.user.findFirst.mockResolvedValue({ id: 1, password: "hashed-pass" });
      (bcryptUtil.comparePassword as jest.Mock).mockResolvedValue(true);

      const result = await authService.login("123", "pass");
      expect(result).toHaveProperty("token", "mock-token");
      expect(result.user).not.toHaveProperty("password");
    });

    it("Skenario Negatif: harus throw error jika password salah", async () => {
      prismaMock.user.findFirst.mockResolvedValue({ id: 1, password: "hashed-pass" });
      (bcryptUtil.comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(authService.login("123", "wrong")).rejects.toThrow(AppError);
    });
  });
});
