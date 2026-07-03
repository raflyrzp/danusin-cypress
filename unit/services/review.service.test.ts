import { ReviewService } from "../../../danusin-backend/src/modules/reviews/review.service";
import { AppError } from "../../../danusin-backend/src/core/middlewares/error.middleware";
import { ORDER_STATUS } from "../../../danusin-backend/src/shared/constants/status.constant";

jest.mock("../../../danusin-backend/src/core/config/database.config.js", () => ({
  prisma: {
    $transaction: jest.fn((callback) => callback(require("../../../danusin-backend/src/core/config/database.config.js").prisma)),
    order: { findUnique: jest.fn() },
    review: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn(), aggregate: jest.fn() },
    image: { createMany: jest.fn(), findMany: jest.fn() },
    notification: { create: jest.fn() },
  },
}));

describe("ReviewService", () => {
  let reviewService: ReviewService;
  let prismaMock: any;

  beforeEach(() => {
    reviewService = new ReviewService();
    prismaMock = require("../../../danusin-backend/src/core/config/database.config.js").prisma;
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("Skenario Positif: berhasil membuat ulasan", async () => {
      prismaMock.order.findUnique.mockResolvedValue({ id: 1, buyer_id: 1, status: ORDER_STATUS.COMPLETED, product: { name: "Produk" } });
      prismaMock.review.findUnique.mockResolvedValue(null);
      prismaMock.review.create.mockResolvedValue({ id: 1 });

      const result = await reviewService.create(1, { order_id: 1, rating: 5 });
      expect(result.id).toBe(1);
    });

    it("Skenario Negatif: throw error jika order belum selesai", async () => {
      prismaMock.order.findUnique.mockResolvedValue({ id: 1, buyer_id: 1, status: ORDER_STATUS.PENDING }); // Belum selesai

      await expect(reviewService.create(1, { order_id: 1, rating: 5 })).rejects.toThrow(AppError);
    });
  });
});
