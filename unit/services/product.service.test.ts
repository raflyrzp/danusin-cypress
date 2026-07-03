import { ProductService } from "../../../danusin-backend/src/modules/products/product.service";
import { AppError } from "../../../danusin-backend/src/core/middlewares/error.middleware";

jest.mock("../../../danusin-backend/src/core/config/database.config.js", () => ({
  prisma: {
    $transaction: jest.fn((callback) => callback(require("../../../danusin-backend/src/core/config/database.config.js").prisma)),
    product: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("../../../danusin-backend/src/modules/images/image.service.js", () => {
  return {
    ImageService: jest.fn().mockImplementation(() => ({
      getPrimaryImagesForEntities: jest.fn().mockResolvedValue(new Map()),
      getByEntity: jest.fn().mockResolvedValue([]),
      createMany: jest.fn(),
      deleteByEntity: jest.fn(),
      delete: jest.fn(),
    })),
  };
});

describe("ProductService", () => {
  let productService: ProductService;
  let prismaMock: any;

  beforeEach(() => {
    productService = new ProductService();
    prismaMock = require("../../../danusin-backend/src/core/config/database.config.js").prisma;
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("Skenario Positif: berhasil membuat produk baru", async () => {
      prismaMock.product.create.mockResolvedValue({ id: 1 });
      prismaMock.product.findUnique.mockResolvedValue({ id: 1, seller: {} });

      const result = await productService.create(1, {
        name: "Produk 1",
        description: "Desc",
        price: 10000,
        po_open_date: "2026-01-01",
        po_close_date: "2026-01-02",
      });

      expect(result.id).toBe(1);
      expect(prismaMock.product.create).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("Skenario Negatif: error update produk bukan pemiliknya", async () => {
      prismaMock.product.findUnique.mockResolvedValue({ id: 1, seller_id: 2 }); // owner is 2

      await expect(
        productService.update(1, 1, {}) // requester is 1
      ).rejects.toThrow(AppError);
    });
  });
});
