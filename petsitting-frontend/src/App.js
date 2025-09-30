import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';
import AnimalList from './pages/AnimalList';
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
import ContractDetailPage from './pages/ContractDetailPage';
import PetsitterProfilePage from './pages/PetsitterProfilePage';
import LegalMentionsPage from './pages/LegalMentionsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

const App = () => {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<AuthForm />} />
            <Route 
              path="/chercher-petsitting" 
              element={<BookingRequestPage />} 
            />
            <Route
              path="/mes-animaux"
              element={
                <PrivateRoute>
                  <AnimalList />
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
                <PrivateRoute>
                  <AvailabilityCalendar />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/mes-informations" 
              element={
                <PrivateRoute>
                  <UserEditPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/mes-annonces" 
              element={
                <PrivateRoute>
                  <AdvertsPage />
                </PrivateRoute>
              } 
            />
            <Route path="/matching-results" element={
                <PrivateRoute>
                  <MatchingResultsPage />
                </PrivateRoute>
              } 
            />
            <Route path="/mes-contrats" element={
                <PrivateRoute>
                  <ContractDetailPage />
                </PrivateRoute>
              } 
            />
            <Route path="/petsitter-profil/:id" element={
              <PrivateRoute>
                <PetsitterProfilePage />
              </PrivateRoute>
              } 
            />
            <Route path="/mentions-legales" element={<LegalMentionsPage />} />
            <Route path="/politique-confidentialite" element={<PrivacyPolicyPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;

