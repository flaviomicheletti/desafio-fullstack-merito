import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import CadastroFundo from './components/CadastroFundo';
import CadastroMovimentacao from './components/CadastroMovimentacao'; 

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Dashboard />} />
//       </Routes>
//     </Router>
//   );
// }

function App() {
  return (
    <Router>
      <div>
        <nav>
          {/* Basic navigation example */}
          <Link to="/">Dashboard</Link> |{' '}
          <Link to="/cadastro-fundo">Cadastrar Fundo</Link> |{' '}
          <Link to="/cadastro-movimentacao">Registrar Movimentação</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cadastro-fundo" element={<CadastroFundo />} />
          <Route path="/cadastro-movimentacao" element={<CadastroMovimentacao />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;