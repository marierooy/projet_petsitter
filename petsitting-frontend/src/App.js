import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthProvider } from './contexts/AuthContext';
import AnimalList from './pages/AnimalList';
import AddAnimalWrapper from './components/AddAnimalWrapper';
import EditAnimalWrapper from './components/EditAnimalWrapper';
import AnimalServicesPage from './pages/AnimalServicesPage';
import ServiceOccurencePage from './pages/ServiceOccurencePage';
import AuthForm from './pages/AuthForm';
import Home from './pages/Home';
import PrivateRoute from './routes/PrivateRoute';
import AvailabilityCalendar from './pages/AvailabilityCalendar';
import UserEditPage from './pages/UserEditPage';
import BookingRequestPage from './pages/BookingRequestPage';
import AdvertsPage from './pages/AdvertsPage';
import MatchingResultsPage from './pages/MatchingResultsPage';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthForm />} />
          <Route
            path="/mes-animaux"
            element={
              <PrivateRoute>
                <AnimalList />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-animal"
            element={
              <PrivateRoute>
                <AddAnimalWrapper />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-animal/:id"
            element={
              <PrivateRoute>
                <EditAnimalWrapper />
              </PrivateRoute>
            }
          />
          <Route 
            path="/services-animaux" 
            element={
              <PrivateRoute>
                <AnimalServicesPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/occurences-services" 
            element={
              <PrivateRoute>
                <ServiceOccurencePage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/disponibilites" 
            element={
                <AvailabilityCalendar />
            } 
          />
          <Route 
            path="/mes-informations" 
            element={
                <UserEditPage />
            } 
          />
          <Route 
            path="/chercher-petsitting" 
            element={
                <BookingRequestPage />
            } 
          />
          <Route 
            path="/mes-annonces" 
            element={
                <AdvertsPage />
            } 
          />
          <Route path="/matching-results" element={<MatchingResultsPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

