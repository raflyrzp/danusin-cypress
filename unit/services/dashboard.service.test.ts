import { DashboardService } from "../../../danusin-backend/src/modules/dashboard/dashboard.service";

jest.mock("../../../danusin-backend/src/core/config/database.config.js", () => ({
  prisma: {
    order: {
      aggregate: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    product: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    image: {
      findMany: jest.fn(),
    },
  },
}));

describe("DashboardService", () => {
  let dashboardService: DashboardService;
  let prismaMock: any;

  beforeEach(() => {
    dashboardService = new DashboardService();
    prismaMock = require("../../../danusin-backend/src/core/config/database.config.js").prisma;
    jest.clearAllMocks();
  });

  describe("getSellerSummary", () => {
    it("Skenario Positif: harus mereturn ringkasan seller dengan benar", async () => {
      prismaMock.order.aggregate.mockResolvedValue({ _sum: { total_price: 150000 } });
      prismaMock.order.count.mockResolvedValue(10);
      prismaMock.product.count.mockResolvedValue(5);
      prismaMock.product.findMany.mockResolvedValue([{ id: 1, name: "P1", stock: 2, orders: [] }]);
      prismaMock.order.findMany.mockResolvedValue([]);
      prismaMock.order.groupBy.mockResolvedValue([{ created_at: new Date(), _sum: { total_price: 50000 } }]);

      const result = await dashboardService.getSellerSummary(1, "30");

      expect(result.total_revenue).toBe(150000);
      expect(result.pending_orders_count).toBe(10);
      expect(result.insights.needsRestock.length).toBe(1); // Karena stock < 5
    });

    it("Skenario Batas: harus mereturn nol jika tidak ada transaksi", async () => {
      prismaMock.order.aggregate.mockResolvedValue({ _sum: { total_price: null } });
      prismaMock.order.count.mockResolvedValue(0);
      prismaMock.product.count.mockResolvedValue(0);
      prismaMock.product.findMany.mockResolvedValue([]);
      prismaMock.order.findMany.mockResolvedValue([]);
      prismaMock.order.groupBy.mockResolvedValue([]);

      const result = await dashboardService.getSellerSummary(1, "all");

      expect(result.total_revenue).toBe(0);
      expect(result.insights.needsRestock.length).toBe(0);
    });
  });
});
