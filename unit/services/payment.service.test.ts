import { PaymentService } from "../../../danusin-backend/src/modules/orders/payment.service";
import { ORDER_STATUS } from "../../../danusin-backend/src/shared/constants/status.constant";

jest.mock("midtrans-client", () => ({
  Snap: jest.fn().mockImplementation(() => ({
    createTransaction: jest.fn().mockResolvedValue({ token: "mock-token" }),
    transaction: {
      notification: jest.fn(),
    },
  })),
}));

jest.mock("../../../danusin-backend/src/core/config/database.config.js", () => ({
  prisma: {
    order: { update: jest.fn() },
  },
}));

describe("PaymentService", () => {
  let paymentService: PaymentService;
  let prismaMock: any;

  beforeEach(() => {
    paymentService = new PaymentService();
    prismaMock = require("../../../danusin-backend/src/core/config/database.config.js").prisma;
    jest.clearAllMocks();
  });

  describe("createTransaction", () => {
    it("Skenario Positif: berhasil menghasilkan token transaksi midtrans", async () => {
      const token = await paymentService.createTransaction(1, 10000);
      expect(token).toBe("mock-token");
    });
  });

  describe("handleWebhook", () => {
    it("Skenario Positif: berhasil memproses webhook dan update ke PENDING (accept)", async () => {
      const snapMock = (paymentService as any).snap;
      snapMock.transaction.notification.mockResolvedValue({
        order_id: "1",
        transaction_status: "capture",
        fraud_status: "accept",
      });

      await paymentService.handleWebhook({});
      expect(prismaMock.order.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: ORDER_STATUS.PENDING },
      });
    });

    it("Skenario Negatif: memproses status cancel", async () => {
      const snapMock = (paymentService as any).snap;
      snapMock.transaction.notification.mockResolvedValue({
        order_id: "1",
        transaction_status: "cancel",
      });

      await paymentService.handleWebhook({});
      expect(prismaMock.order.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: ORDER_STATUS.CANCELLED },
      });
    });
  });
});
