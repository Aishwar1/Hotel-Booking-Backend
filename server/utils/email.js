import transporter from "../configs/nodemailer.js";

export const sendBookingCreatedEmail = ({ to, name, hotelName, checkInDate, checkOutDate, totalPrice, paymentMethod }) => {
  return transporter.sendMail({
    from: `${process.env.SENDER_NAME || "TravelWithAsh"} <${process.env.SENDER_EMAIL}>`,
    to,
    subject: "TravelWithAsh Booking Confirmation",
    html: `
      <h2>Booking Confirmed 🎉</h2>
      <p>Hello <b>${name}</b>,</p>
      <p>Your booking has been created successfully.</p>
      <hr>
      <p><b>Hotel:</b> ${hotelName}</p>
      <p><b>Check In:</b> ${new Date(checkInDate).toDateString()}</p>
      <p><b>Check Out:</b> ${new Date(checkOutDate).toDateString()}</p>
      <p><b>Total:</b> $${totalPrice}</p>
      <p><b>Payment:</b> ${paymentMethod}</p>
      <hr>
      <p>Thank you for choosing TravelWithAsh ❤️</p>
    `,
  });
};

export const sendPaymentConfirmationEmail = ({ to, name, hotelName, roomType, checkInDate, checkOutDate, totalPrice }) => {
  return transporter.sendMail({
    from: `${process.env.SENDER_NAME || "TravelWithAsh"} <${process.env.SENDER_EMAIL}>`,
    to,
    subject: "TravelWithAsh Payment Confirmed",
    html: `
      <h2>Payment Successful ✅</h2>
      <p>Hello <b>${name}</b>,</p>
      <p>Your payment has been received and your booking is now confirmed.</p>
      <hr>
      <p><b>Hotel:</b> ${hotelName}</p>
      <p><b>Room:</b> ${roomType}</p>
      <p><b>Check In:</b> ${new Date(checkInDate).toDateString()}</p>
      <p><b>Check Out:</b> ${new Date(checkOutDate).toDateString()}</p>
      <p><b>Amount Paid:</b> $${totalPrice}</p>
      <hr>
      <p>We look forward to hosting you with TravelWithAsh ❤️</p>
    `,
  });
};

export const sendBookingCancelledEmail = ({ to, name, hotelName, checkInDate, checkOutDate }) => {
  return transporter.sendMail({
    from: `${process.env.SENDER_NAME || "TravelWithAsh"} <${process.env.SENDER_EMAIL}>`,
    to,
    subject: "TravelWithAsh Booking Cancelled",
    html: `
      <h2>Booking Cancelled</h2>
      <p>Hello <b>${name}</b>,</p>
      <p>Your booking at <b>${hotelName}</b> has been cancelled.</p>
      <hr>
      <p><b>Check In:</b> ${new Date(checkInDate).toDateString()}</p>
      <p><b>Check Out:</b> ${new Date(checkOutDate).toDateString()}</p>
      <hr>
      <p>If you did not request this cancellation, please contact support.</p>
    `,
  });
};
