export function transformDailyAnalytics(bookings, totalRooms) {
  const days = {};

  bookings.forEach((booking) => {
    const start = new Date(booking.fromDate);

    const end = new Date(booking.toDate);

    if (start >= end) {
      return;
    }

    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    const nightlyPrice = booking.totalPrice / nights;

    let current = new Date(start);

    while (current < end) {
      const key = current.toISOString().split("T")[0];

      if (!days[key]) {
        days[key] = {
          date: key,
          bookedRooms: 0,
          availableRooms: 0,
          totalRooms,
          revenue: 0,
          occupancy: 0,
          surgeFactor: 1,
          closed: false,
        };
      }

      days[key].bookedRooms += 1;

      days[key].revenue += nightlyPrice;

      current.setDate(current.getDate() + 1);
    }
  });

  return Object.values(days)
    .map((day) => {
      day.availableRooms = Math.max(0, day.totalRooms - day.bookedRooms);

      day.occupancy = day.totalRooms
        ? (day.bookedRooms / day.totalRooms) * 100
        : 0;

      day.revenue = Number(day.revenue.toFixed(2));

      day.occupancy = Number(day.occupancy.toFixed(2));

      return day;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}
