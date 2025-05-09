import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from "./pages/Calendar";
import BookingForm from "./pages/BookingForm";
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

function App() {
  return (
    <>
      <SignedIn>
      <BrowserRouter>
        <nav>
        <Link to="/">Home</Link>
        <Link to="/bookingform">Booking Form</Link>
        <UserButton />
        </nav>

        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bookingform" element={<BookingForm />} />
        </Routes>
      </BrowserRouter>
      </SignedIn>
      <SignedOut>
      <div>
        <h1>Welcome to the App</h1>
        <SignInButton />
      </div>
      </SignedOut>
    </>
  );
}

export default App;
