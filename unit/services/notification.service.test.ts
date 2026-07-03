import { NotificationService } from "../../../danusin-backend/src/modules/notifications/notification.service";
import { AppError } from "../../../danusin-backend/src/core/middlewares/error.middleware";

jest.mock("../../../danusin-backend/src/core/config/database.config.js", () => ({
  prisma: {
    notification: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

describe("NotificationService", () => {
  let notificationService: NotificationService;
  let prismaMock: any;

  beforeEach(() => {
    notificationService = new NotificationService();
    prismaMock = require("../../../danusin-backend/src/core/config/database.config.js").prisma;
    jest.clearAllMocks();
  });

  describe("markAsRead", () => {
    it("Skenario Positif: berhasil menandai notifikasi dibaca", async () => {
      prismaMock.notification.findUnique.mockResolvedValue({ user_id: 1 });
      prismaMock.notification.update.mockResolvedValue({});

      await notificationService.markAsRead(1, 1);
      expect(prismaMock.notification.update).toHaveBeenCalled();
    });

    it("Skenario Negatif: error jika bukan pemilik notifikasi", async () => {
      prismaMock.notification.findUnique.mockResolvedValue({ user_id: 2 }); // milik orang lain
      await expect(notificationService.markAsRead(1, 1)).rejects.toThrow(AppError);
    });
  });
});
