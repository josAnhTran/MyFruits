import './App.css';
import styles from './App.module.css';

import {BrowserRouter, NavLink, Route, Routes} from 'react-router-dom';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import Index from './pages/Index';
import Suppliers from './pages/Suppliers';
import Customers from './pages/UpListPictures';
import Employees from './pages/Employees';
import Products from './pages/Products';
import Home from './pages/Home';
import Login from './pages/Login';
import DemoUseReducer from './pages/DemoUseReducer';
import ReduxExamples from './pages/ReduxExamples';


function App() {
  return (
    <div className={styles.container}>
     <BrowserRouter>
      <ul className= {styles.navigation}>
        <li className={styles.link}>
        <NavLink to= 'index'  className= {({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>Trang Chủ</NavLink>
        </li>
        <li className={styles.link}>
        <NavLink to= 'login'  className= {({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>Đăng Nhập</NavLink>
        </li>
        <li className={styles.link}>
        <NavLink to= 'orders'  className= {({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>Đơn Đặt Hàng</NavLink>
        </li>

        <li className={styles.link}>
        <NavLink to= 'categories'  className= {({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>Nhóm Sản Phẩm</NavLink>
        </li>

        <li className={styles.link}>
        <NavLink to= 'suppliers'  className= {({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>Nhà Phân Phối</NavLink>
        </li>

        <li className={styles.link}>
        <NavLink to= 'products'  className= {({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>Sản Phẩm</NavLink>
        </li>

        <li className={styles.link}>
        <NavLink to= 'employees'  className= {({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>Nhân Viên</NavLink>
        </li>

        {/* <li className={styles.link}>
        <NavLink to= 'customers'  className= {({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>Khách Hàng</NavLink>
        </li> */}
        <li className={styles.link}>
        <NavLink to= 'customers'  className= {({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>Demo</NavLink>
        </li>
      </ul>

      {/* ROUTES SETTINGS */}
      <div className={styles.routerArea}>
        <Routes>
          <Route path='/index' element={<ReduxExamples/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/' element={<Index/>}/>
          <Route path='/orders' element={<Orders/>}/>
          <Route path='/categories' element={<Categories/>}/>
          <Route path='/suppliers' element={<Suppliers/>}/>
          <Route path='/products' element={<Products/>}/>
          <Route path='/customers' element={<Customers/>}/>
          <Route path='/employees' element={<Employees/>}/>

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