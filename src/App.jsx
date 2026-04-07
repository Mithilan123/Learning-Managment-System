import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CourseProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CourseProvider>
    </AuthProvider>
  );
}

export default App;
