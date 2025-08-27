import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HideLoading, ShowLoading } from "../../redux/loaderSlice";
import { getShowById } from "../../api/shows";
import { useNavigate, useParams } from "react-router-dom";
import { message, Card, Row, Col, Button } from "antd";
import moment from "moment";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { bookShow, makePayment } from "../../api/booking";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Checkout Form Component
const CheckoutForm = ({ amount, onPaymentSuccess, selectedSeats, show, user }) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    dispatch(ShowLoading());

    const cardElement = elements.getElement(CardElement);

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        message.error(error.message);
        setIsLoading(false);
        dispatch(HideLoading());
        return;
      }

      // Create payment intent on server
      const response = await makePayment(
        paymentMethod,
        amount
      );

      if (response.success) {
        message.success(response.message);
        // Book the show
        const bookingResponse = await bookShow({
          show: show._id,
          transactionId: response.data,
          seats: selectedSeats,
          user: user._id,
        });

        if (bookingResponse.success) {
          message.success(bookingResponse.message);
          // Clear session storage after successful booking
          sessionStorage.removeItem('selectedShow');
          navigate("/profile");
        } else {
          message.error(bookingResponse.message);
        }
      } else {
        message.error(response.message);
      }
    } catch (err) {
      message.error("Payment failed. Please try again.");
    }

    setIsLoading(false);
    dispatch(HideLoading());
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-width-600 mx-auto">
        <div className="booking-summary" style={{ marginBottom: '2rem' }}>
          <h3>💳 Payment Details</h3>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Please enter your card details to complete the booking
          </p>
          
          <div style={{ 
            padding: '1.5rem', 
            border: '2px solid #e1e5e9', 
            borderRadius: '12px', 
            marginBottom: '1.5rem',
            backgroundColor: '#fafafa',
            transition: 'border-color 0.3s ease'
          }}>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                    fontSmoothing: 'antialiased',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a'
                  }
                },
              }}
            />
          </div>
          
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isLoading}
            disabled={!stripe || isLoading}
            block
            size="large"
            style={{
              height: '48px',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #e94560 0%, #d63447 100%)',
              border: 'none'
            }}
          >
            {isLoading ? 'Processing Payment...' : `💳 Pay Rs. ${amount / 100}`}
          </Button>
          
          <p style={{ 
            textAlign: 'center', 
            marginTop: '1rem', 
            fontSize: '0.85rem', 
            color: '#999' 
          }}>
            🔒 Your payment information is secure and encrypted
          </p>
        </div>
      </div>
    </form>
  );
};

const BookShow = () => {
  // Redux state and hooks
  const { user } = useSelector((state) => state.users); // Extracting user from Redux state
  const dispatch = useDispatch(); // Redux dispatch function
  const [show, setShow] = useState(); // State for holding show details
  const [selectedSeats, setSelectedSeats] = useState([]); // State for managing selected seats
  const navigate = useNavigate(); // Navigation hook

  // Function to fetch show data by ID
  const getData = async () => {
    try {
      // Get show data from session storage
      const storedShowData = sessionStorage.getItem('selectedShow');
      
      if (!storedShowData) {
        message.error('No show selected. Please select a show first.');
        navigate('/');
        return;
      }

      const { showId } = JSON.parse(storedShowData);

      dispatch(ShowLoading()); // Dispatching action to show loading state
      const response = await getShowById({ showId }); // API call to fetch show details
      if (response.success) {
        setShow(response.data); // Setting state with fetched show data
        // message.success(response.message); // Optional success message
      } else {
        message.error(response.message); // Displaying error message if API call fails
      }
      dispatch(HideLoading()); // Dispatching action to hide loading state
    } catch (err) {
      message.error(err.message); // Handling errors from API call
      dispatch(HideLoading()); // Hiding loading state on error
    }
  };

  // Function to generate seat layout dynamically
  const getSeats = () => {
    let columns = 12; // Number of columns for seating arrangement
    // let totalSeats = 120; // Total number of seats
    // let rows = totalSeats / columns; // Calculating number of rows
    let totalSeats = show.totalSeats;
    let rows = Math.ceil(totalSeats / columns);

    return (
      <div className="d-flex flex-column align-items-center">
        {/* Screen Display */}
        <div className="seat-selection-container">
          <div className="screen-container">
            <p className="screen-text">
              🎬 Screen - You will be watching in this direction
            </p>
            <div className="screen-div"></div>
          </div>

          {/* Seat Legend */}
          <div className="seat-legend">
            <div className="legend-item">
              <div className="legend-seat legend-available"></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="legend-seat legend-selected"></div>
              <span>Selected</span>
            </div>
            <div className="legend-item">
              <div className="legend-seat legend-booked"></div>
              <span>Booked</span>
            </div>
          </div>

          {/* Seat Layout */}
          <div className="seat-layout">
            {Array.from(Array(rows).keys()).map((rowIndex) => (
              <div key={rowIndex} className="seat-row">
                <div className="row-label">{String.fromCharCode(65 + rowIndex)}</div>
                {Array.from(Array(columns).keys()).map((columnIndex) => {
                  let seatNumber = rowIndex * columns + columnIndex + 1;
                  
                  let seatClass = "seat-btn";
                  if (selectedSeats.includes(seatNumber)) {
                    seatClass += " selected";
                  }
                  if (show.bookedSeats.includes(seatNumber)) {
                    seatClass += " booked";
                  }
                  
                  if (seatNumber <= totalSeats) {
                    return (
                      <button
                        key={seatNumber}
                        className={seatClass}
                        onClick={() => {
                          if (!show.bookedSeats.includes(seatNumber)) {
                            if (selectedSeats.includes(seatNumber)) {
                              setSelectedSeats(
                                selectedSeats.filter(
                                  (curSeatNumber) => curSeatNumber !== seatNumber
                                )
                              );
                            } else {
                              setSelectedSeats([...selectedSeats, seatNumber]);
                            }
                          }
                        }}
                        disabled={show.bookedSeats.includes(seatNumber)}
                        title={`Seat ${seatNumber}${show.bookedSeats.includes(seatNumber) ? ' (Booked)' : ''}`}
                      >
                        {columnIndex + 1}
                      </button>
                    );
                  }
                  return null;
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Booking Summary */}
        {selectedSeats.length > 0 && (
          <div className="booking-summary max-width-600 mx-auto">
            <h3>🎟️ Booking Summary</h3>
            
            <div className="summary-row">
              <span className="summary-label">Selected Seats:</span>
              <span className="selected-seats">{selectedSeats.join(", ")}</span>
            </div>
            
            <div className="summary-row">
              <span className="summary-label">Number of Tickets:</span>
              <span className="summary-value">{selectedSeats.length}</span>
            </div>
            
            <div className="summary-row">
              <span className="summary-label">Price per Ticket:</span>
              <span className="summary-value">Rs. {show.ticketPrice}</span>
            </div>
            
            <div className="summary-row">
              <span className="summary-label">Total Amount:</span>
              <span className="summary-value">Rs. {selectedSeats.length * show.ticketPrice}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Effect hook to fetch data on component mount
  useEffect(() => {
    getData();
  }, []);

  // JSX rendering
  return (
    <div className="booking-container">
      {show && (
        <Row gutter={24}>
          <Col span={24}>
            <Card
              title={
                <div className="movie-title-details">
                  <h1>{show.movie.title}</h1>
                  <p>
                    Theatre: {show.theatre.name}, {show.theatre.address}
                  </p>
                </div>
              }
              extra={
                <div className="show-name py-3">
                  <h3>
                    <span>Show Name:</span> {show.name}
                  </h3>
                  <h3>
                    <span>Date & Time: </span>
                    {moment(show.date).format("MMM Do YYYY")} at{" "}
                    {moment(show.time, "HH:mm").format("hh:mm A")}
                  </h3>
                  <h3>
                    <span>Ticket Price:</span> Rs. {show.ticketPrice}/-
                  </h3>
                  <h3>
                    <span>Total Seats:</span> {show.totalSeats}
                    <span> &nbsp;|&nbsp; Available Seats:</span>{" "}
                    {show.totalSeats - show.bookedSeats.length}
                  </h3>
                </div>
              }
              style={{ width: "100%" }}
            >
              {getSeats()} {/* Rendering dynamic seat layout */}
              {selectedSeats.length > 0 && (
                <Elements stripe={stripePromise}>
                  <CheckoutForm
                    amount={selectedSeats.length * show.ticketPrice * 100}
                    selectedSeats={selectedSeats}
                    show={show}
                    user={user}
                  />
                </Elements>
              )}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default BookShow;
