import OAuth2SignupForm from './components/auth/OAuth2SignupForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/oauth2/signup" element={<OAuth2SignupForm />} />
      </Routes>
    </Router>
  );
}

export default App;
