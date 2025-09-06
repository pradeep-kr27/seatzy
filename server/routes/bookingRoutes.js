/***
 * SMTP servers = simple mail transfer protocol
 * how smtp servers works
 *  1. writing the email ( composing the letter)
 * 2. sending to SMTP server ( dropping at the post office )
 * 3. routing the email ( post office will route the email to the destination)
 * 4. recipient email serv ( destination post office)
 * 5. emai; deliver ( mailbox deliver)
 *
 * nodemailer
 */

const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const authMiddleware = require("../middlewares/authMiddleware");
const Booking = require("../models/bookingModel");
const Show = require("../models/showModel");
const User = require("../models/userModel");
const EmailHelper = require("../utils/emailHelper");

router.post("/make-payment", authMiddleware, async (req, res) => {
  try {
    const { paymentMethod, amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "inr", // Changed to INR for Indian Rupees
      payment_method: paymentMethod.id,
      confirm: true,
      return_url: `${process.env.CLIENT_URL}/profile`,
      description: "Movie Ticket Booking",
    });

    const transactionId = paymentIntent.id;
    res.send({
      success: true,
      message: "Payment Successful",
      data: transactionId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/book-show", authMiddleware, async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    
    // Get show details with populated movie and theatre
    const show = await Show.findById(req.body.show)
      .populate("movie")
      .populate("theatre");
    
    // Get user details
    const user = await User.findById(req.body.user);
    
    // Update booked seats
    const updatedBookedSeats = [...show.bookedSeats, ...req.body.seats];
    await Show.findByIdAndUpdate(req.body.show, {
      bookedSeats: updatedBookedSeats,
    });

    // Prepare email data for booking confirmation
    const emailData = {
      userName: user.name,
      userEmail: user.email,
      movieName: show.movie.title,
      theatreName: show.theatre.name,
      showDate: new Date(show.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      showTime: show.time,
      seats: req.body.seats.map(seat => `<span class="seats">${seat}</span>`).join(' '),
      transactionId: req.body.transactionId
    };

    // Send booking confirmation email
    try {
      await EmailHelper("booking_confirmation.html", user.email, emailData, 'booking_confirmation');
      console.log(`Booking confirmation email sent to ${user.email}`);
    } catch (emailError) {
      console.log("Failed to send confirmation email:", emailError);
      // Don't fail the booking if email fails
    }

    res.send({
      success: true,
      message: "Booking Successful",
      data: newBooking,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/get-all-bookings/:userId", authMiddleware, async (req, res) => {
  try {
    const data = await Booking.find({ user: req.params.userId });
    console.log(data);
    const bookings = await Booking.find({ user: req.params.userId })
      .populate("user")
      .populate("show")
      .populate({
        path: "show",
        populate: {
          path: "movie",
          model: "movies",
        },
      })
      .populate({
        path: "show",
        populate: {
          path: "theatre",
          model: "theatres",
        },
      });
    res.send({
      success: true,
      message: "All bookings fetched",
      data: bookings,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
