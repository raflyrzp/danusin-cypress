import { UploadService } from "../../../danusin-backend/src/modules/upload/upload.service";
import { AppError } from "../../../danusin-backend/src/core/middlewares/error.middleware";
import fs from "node:fs/promises";

jest.mock("node:fs/promises", () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
}));

jest.mock("../../../danusin-backend/src/core/config/env.config.js", () => ({
  config: {
    upload: { dir: "uploads", maxSize: 1048576, allowedExtensions: ["jpg", "png"] },
    server: { port: 3000 },
    logging: { level: "info" },
  },
}));

describe("UploadService", () => {
  let uploadService: UploadService;

  beforeEach(() => {
    uploadService = new UploadService();
    jest.clearAllMocks();
  });

  describe("uploadImage", () => {
    it("Skenario Positif: file valid berhasil diunggah", async () => {
      const file = { name: "test.jpg", data: Buffer.from("data"), size: 500, mimetype: "image/jpeg" };
      const url = await uploadService.uploadImage(file);
      
      expect(fs.writeFile).toHaveBeenCalledTimes(2); // Untuk uploadDir dan frontendDir
      expect(url).toContain("http://localhost:3000/uploads/");
    });

    it("Skenario Batas: file melebihi batas ukuran", async () => {
      const file = { name: "test.jpg", data: Buffer.from("data"), size: 2000000, mimetype: "image/jpeg" }; // > 1MB
      await expect(uploadService.uploadImage(file)).rejects.toThrow(AppError);
    });

    it("Skenario Negatif: ekstensi file dilarang", async () => {
      const file = { name: "test.pdf", data: Buffer.from("data"), size: 500, mimetype: "application/pdf" };
      await expect(uploadService.uploadImage(file)).rejects.toThrow(AppError);
    });
  });
});
