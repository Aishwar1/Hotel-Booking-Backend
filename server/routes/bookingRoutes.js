import express from 'express';
import {
  checkAvailabilityAPI,
  createBooking,
  cancelBooking,
  getHotelBookings,
  getUserBookings,
  getRoomBookedDates,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailabilityAPI);
bookingRouter.get('/room/:roomId/dates', getRoomBookedDates);
bookingRouter.post('/book', protect, createBooking);
// bookingRouter.post('/book', createBooking);
bookingRouter.get('/user', protect, getUserBookings);
bookingRouter.get('/hotel', protect, getHotelBookings);
bookingRouter.post('/cancel', protect, cancelBooking);

export default bookingRouter;
