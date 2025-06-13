const { Booking, Service, User, Notification } = require('../models');
const ApiError = require('../exceptions/api-error');

class BookingController {
    async createBooking(req, res, next) {
        try {
            const { service_id, work_slot_id, start_time, duration } = req.body;
            const userId = req.user.id;

            const isAvailable = await this.checkSlotAvailability(work_slot_id, start_time, duration);
            if (!isAvailable) {
                throw ApiError.BadRequest('Выбранное время уже занято');
            }

            const booking = await Booking.create({
                user_id: userId,
                service_id,
                work_slot_id,
                start_time,
                duration
            });

            const service = await Service.findByPk(service_id);
            const user = await User.findByPk(userId);

            await Notification.create({
                user_id: userId,
                message: `Вы записаны на "${service.title}" на ${new Date(start_time).toLocaleString()}`,
                booking_id: booking.id
            });

            return res.json(booking);
        } catch (error) {
            next(error);
        }
    }

    async getUserBookings(req, res, next) {
        try {
            const bookings = await Booking.findAll({
                where: { user_id: req.user.id },
                include: [Service],
                order: [['start_time', 'DESC']]
            });
            res.json(bookings);
        } catch (error) {
            next(error);
        }
    }

    async cancelBooking(req, res, next) {
        try {
            const { id } = req.params;
            
            const booking = await Booking.findOne({
                where: { id, user_id: req.user.id }
            });

            if (!booking) {
                throw ApiError.NotFound('Бронирование не найдено');
            }

            const service = await Service.findByPk(booking.service_id);
            await Notification.create({
                user_id: req.user.id,
                message: `Запись на "${service.title}" отменена`
            });

            await booking.destroy();
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new BookingController();