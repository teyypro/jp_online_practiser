import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Components/Home/Home';
import CreatePage from './Components/CreatePage/CreatePage';
import ExerciseList from './Components/ExcerciseList/ExcerciseList';
import ExerciseDetail from './Components/ExcerciseList/ExerciseDetail';
function App() {
  return (
    <BrowserRouter basename='jp_online_practiser'>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/create' element={<CreatePage/>}/>
        <Route path='/list' element={<ExerciseList/>}/>
        <Route path="/exercise/:id" element={<ExerciseDetail />} />
      </Routes>
      
    </BrowserRouter>
  )
}

export default App;
