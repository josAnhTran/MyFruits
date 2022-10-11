import logo from './logo.svg';
import './App.css';
import styles from './App.module.css';

import {BrowserRouter, NavLink, Route, Routes} from 'react-router-dom';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import Employees from './pages/Employees';
import Products from './pages/Products';


function App() {
  return (
    <div className="App">
     <BrowserRouter>
      <ul>
        <li className={styles.link}>
        <NavLink to= 'orders'>Danh Mục Đơn Đặt Hàng</NavLink>

        </li>
        <li className={styles.link}>
        <NavLink to= 'categories'>Danh Mục Sản Phẩm</NavLink>

        </li>
        <li className={styles.link}>
        <NavLink to= 'suppliers'>Danh Mục Nhà Phân Phối</NavLink>

        </li>
        <li className={styles.link}>
        <NavLink to= 'products'>Danh Mục Sản Phẩm</NavLink>

        </li>
        <li className={styles.link}>
        <NavLink to= 'employees'>Danh Sách Nhân Viên</NavLink>

        </li>
        <li className={styles.link}>
        <NavLink to= 'customers'>Danh Sách Khách Hàng</NavLink>

        </li>
      </ul>

      {/* ROUTES SETTINGS */}
      <div className={styles.routerArea}>
        <Routes>
          <Route path='/' element={<Orders/>}/>
          <Route path='/' element={<Categories/>}/>
          <Route path='' element={<Suppliers/>}/>
          <Route path='' element={<Products/>}/>
          <Route path='' element={<Customers/>}/>
          <Route path='' element={<Employees/>}/>

          {/* NO MATCHING ROUTE */}
          <Route
          path='*'
          element={
            <main style={{padding: '1rem'}}>
              <p>404 Page not found 😂😂😂</p>
            </main>
          }
          >

          </Route>
        </Routes>
      </div>
     </BrowserRouter>
    </div>
  );
}

export default App;
