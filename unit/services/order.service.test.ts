import { OrderService } from "../../../danusin-backend/src/modules/orders/order.service";
import { AppError } from "../../../danusin-backend/src/core/middlewares/error.middleware";
import * as dateUtil from "../../../danusin-backend/src/shared/utils/date.util";

jest.mock("../../../danusin-backend/src/core/config/database.config.js", () => ({
  prisma: {
    $transaction: jest.fn((callback) => callback(require("../../../danusin-backend/src/core/config/database.config.js").prisma)),
    product: { findUnique: jest.fn(), update: jest.fn() },
    order: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    notification: { create: jest.fn() },
    image: { findMany: jest.fn(), findFirst: jest.fn() },
  },
}));

jest.mock("../../../danusin-backend/src/shared/utils/date.util.js", () => ({
  isPOOpen: jest.fn(),
}));

jest.mock("../../../danusin-backend/src/modules/orders/payment.service.js", () => {
  return { PaymentService: jest.fn().mockImplementation(() => ({ createTransaction: jest.fn() })) };
});

describe("OrderService", () => {
  let orderService: OrderService;
  let prismaMock: any;

  beforeEach(() => {
    orderService = new OrderService();
    prismaMock = require("../../../danusin-backend/src/core/config/database.config.js").prisma;
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("Skenario Positif: pesanan berhasil dibuat dengan status PENDING", async () => {
      (dateUtil.isPOOpen as jest.Mock).mockReturnValue(true);
      prismaMock.product.findUnique.mockResolvedValue({ id: 1, seller_id: 2, stock: 10, price: 5000 });
      prismaMock.order.create.mockResolvedValue({ id: 1, status: "PENDING" });

      const result = await orderService.create(1, { product_id: 1, quantity: 2, payment_method: "COD" });
      expect(result.status).toBe("PENDING");
      expect(prismaMock.product.update).toHaveBeenCalled(); // stock decremented
    });

    it("Skenario Negatif: throw error jika stok tidak cukup", async () => {
      (dateUtil.isPOOpen as jest.Mock).mockReturnValue(true);
      prismaMock.product.findUnique.mockResolvedValue({ id: 1, seller_id: 2, stock: 1, price: 5000 });

      await expect(orderService.create(1, { product_id: 1, quantity: 2, payment_method: "COD" })).rejects.toThrow(AppError);
    });

    it("Skenario Batas: throw error jika membeli produk sendiri", async () => {
      (dateUtil.isPOOpen as jest.Mock).mockReturnValue(true);
      prismaMock.product.findUnique.mockResolvedValue({ id: 1, seller_id: 1, stock: 10, price: 5000 }); // buyer == seller

      await expect(orderService.create(1, { product_id: 1, quantity: 1, payment_method: "COD" })).rejects.toThrow(AppError);
    });
  });
});
