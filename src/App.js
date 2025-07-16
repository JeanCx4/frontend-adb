import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AppWithNavbar from './AppWithNavbar';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<AppWithNavbar />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
