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
          <Route path="/services-animaux" element={<AnimalServicesPage />} />
          <Route path="/occurences-services" element={<ServiceOccurencePage />} />
          <Route path="/availabilities" element={<AvailabilityCalendar />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

