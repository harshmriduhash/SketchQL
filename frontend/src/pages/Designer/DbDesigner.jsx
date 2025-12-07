import Table from "../../components/DbDesign/Table"
import NavBar from "../../components/Navbar/NavBar"
import Sidebar from "../../components/Sidebar/Sidebar"

export default function App(){
  return(
    <div className="d-flex flex-column vh-100">
      <NavBar />
      <div className="d-flex flex-grow-1 overflow-hidden">
        <Sidebar />
        <div className="flex-grow-1 h-100 position-relative">
           <Table />
        </div>

      </div>
    </div>
  )
}