import './App.css'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
  QueryClientProvider,
} from '@tanstack/react-query'
import HomePage from "./Homepage"
import { GetAuth, queryClient } from "./Auth"

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <Router>
      <Routes>
        <Route path="/" element={<GetAuth><HomePage auth={null}/></GetAuth>} />
      </Routes>
    </Router>
    </QueryClientProvider>
  )
}

export default App
