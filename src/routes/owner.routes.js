import express from "express";
import ownerController from "../controllers/owner.controller.js";
import authMiddleware, { requireRole } from "../utils/auth.js";

const router = express.Router();

router.use(authMiddleware, requireRole("owner"));

// Owner Hotels
router.post("/hotels", ownerController.createHotel);
router.get("/hotels", ownerController.getMyHotels);
router.get("/hotels/:hotelId", ownerController.getMyHotelById);
router.put("/hotels/:hotelId", ownerController.updateMyHotel);
router.patch("/hotels/:hotelId/activate", ownerController.activateMyHotel);
router.delete("/hotels/:hotelId", ownerController.deleteMyHotel);

// Owner Rooms
router.post("/hotels/:hotelId/rooms", ownerController.createRoom);
router.get("/hotels/:hotelId/rooms", ownerController.getRoomsByHotel);
router.put("/rooms/:roomId", ownerController.updateRoom);
router.delete("/rooms/:roomId", ownerController.deleteRoom);

export default router;
