import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from "./pages/Home";
import BookingForm from "./pages/BookingForm";

function App() {
  return (
    <>
      <BrowserRouter>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/bookingform">Booking Form</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/bookingform" element={<BookingForm/>}/>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
