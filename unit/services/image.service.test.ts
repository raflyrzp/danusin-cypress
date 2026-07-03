import { ImageService } from "../../../danusin-backend/src/modules/images/image.service";
import { AppError } from "../../../danusin-backend/src/core/middlewares/error.middleware";
import { EntityType } from "@prisma/client";

jest.mock("../../../danusin-backend/src/core/config/database.config.js", () => ({
  prisma: {
    image: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      aggregate: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

describe("ImageService", () => {
  let imageService: ImageService;
  let prismaMock: any;

  beforeEach(() => {
    imageService = new ImageService();
    prismaMock = require("../../../danusin-backend/src/core/config/database.config.js").prisma;
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("Skenario Positif: berhasil membuat gambar", async () => {
      prismaMock.image.updateMany.mockResolvedValue({});
      prismaMock.image.aggregate.mockResolvedValue({ _max: { sort_order: 1 } });
      prismaMock.image.create.mockResolvedValue({ id: 1, url: "test.jpg" });

      const result = await imageService.create({ url: "test.jpg", entity_type: EntityType.product, entity_id: 1, is_primary: true });
      expect(result.id).toBe(1);
    });
  });

  describe("delete", () => {
    it("Skenario Negatif: throw error jika gambar tidak ada saat dihapus", async () => {
      prismaMock.image.findUnique.mockResolvedValue(null);

      await expect(imageService.delete(99)).rejects.toThrow(AppError);
    });

    it("Skenario Positif: berhasil menghapus gambar dan mengatur primary baru jika perlu", async () => {
      prismaMock.image.findUnique.mockResolvedValue({ id: 1, is_primary: true, entity_type: "product", entity_id: 1 });
      prismaMock.image.delete.mockResolvedValue({});
      prismaMock.image.findFirst.mockResolvedValue({ id: 2 });
      prismaMock.image.update.mockResolvedValue({});

      await imageService.delete(1);
      expect(prismaMock.image.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 2 } }));
    });
  });
});
