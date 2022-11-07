import './App.css';
import styles from './App.module.css';

import {BrowserRouter, Link, NavLink, Route, Routes} from 'react-router-dom';
import Home from './pages/Home';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import Index from './pages/Index';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import Employees from './pages/Employees';
import Products from './pages/Products';
import Login from './pages/Login';
import useAuth from './hooks/useAuth';
import { Fragment } from 'react';
import { Avatar, Col, Dropdown, Layout, Menu, Row, Space } from 'antd';
import { Content, Header } from 'antd/lib/layout/layout';
import { LoginOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';


function App() {
const  {signOut, auth} = useAuth((state) => state)
return (
  <Fragment>
    <BrowserRouter>
      <Layout>
        <Header style={{ paddingLeft: 16, paddingRight: 16 }} >
<Row gutter={[0, 0]}>
  <Col flex={1}>
    <h1 style={{color: 'white'}} >ONLINE-SHOP</h1>
  </Col>
  <Col>
                {!auth && (
                  <Link style={{ color: 'white' }} to='/login'>
                    Đăng nhập
                  </Link>
                )}
                {auth && (
                  <Dropdown
                    overlay={
                      <Menu style={{ marginTop: 22 }}>
                        <Menu.Item key='user'>
                          <Space>
                            <UserOutlined />
                            <span>Xin chào: {auth.payload.email}</span>
                          </Space>
                        </Menu.Item>
                        <Menu.Item key='settings'>
                          <Space>
                            <SettingOutlined />
                            Cấu hình tài khoản
                          </Space>
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                          key='signOut'
                          onClick={() => {
                            signOut();
                          }}
                        >
                          <Space>
                            <LoginOutlined />
                            Thoát
                          </Space>
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <span>
                      <Avatar size='default' className='avatar' src={'https://i.pravatar.cc/150?img=45'} alt='avatar' />
                    </span>
                  </Dropdown>
                )}
              </Col>
</Row>
        </Header>
<Content>
  {/* ROUTES SETTINGS */}
  <Routes>
  <Route path='/' element={<Index/>}/>
           <Route path='/' element={<Home/>}/>
           <Route path='/orders' element={<Orders/>}/>
           <Route path='/categories' element={<Categories/>}/>
           <Route path='/suppliers' element={<Suppliers/>}/>
           <Route path='/products' element={<Products/>}/>
           <Route path='/customers' element={<Customers/>}/>
           <Route path='/employees' element={<Employees/>}/>
           <Route path='/login' element={<Login />} />


              {/* NO MATCH ROUTE */}
              <Route
                path='*'
                element={
                  <main style={{ padding: '1rem' }}>
                    <p>404 Page not found 😂😂😂</p>
                  </main>
                }
              />
            </Routes>
</Content>


      </Layout>
    </BrowserRouter>
  </Fragment>
)



  // return (
  //   <div className={styles.container}>
  //    <BrowserRouter>
  //     <ul className= {styles.navigation}>
  //       <li className={styles.link}>
  //       <NavLink to= 'index'  className= {({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>Trang Chủ</NavLink>
  //       </li>

  //       <li className={styles.link}>
  //       <NavLink to= 'orders'  className= {({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>Đơn Đặt Hàng</NavLink>
  //       </li>

  //       <li className={styles.link}>
  //       <NavLink to= 'categories'  className= {({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>Nhóm Sản Phẩm</NavLink>
  //       </li>

  //       <li className={styles.link}>
  //       <NavLink to= 'suppliers'  className= {({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>Nhà Phân Phối</NavLink>
  //       </li>

  //       <li className={styles.link}>
  //       <NavLink to= 'products'  className= {({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>Sản Phẩm</NavLink>
  //       </li>

  //       <li className={styles.link}>
  //       <NavLink to= 'employees'  className= {({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>Nhân Viên</NavLink>
  //       </li>

  //       <li className={styles.link}>
  //       <NavLink to= 'customers'  className= {({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>Khách Hàng</NavLink>
  //       </li>
  //     </ul>

  //     {/* ROUTES SETTINGS */}
  //     <div className={styles.routerArea}>
  //       <Routes>
  //         <Route path='/' element={<Index/>}/>
  //         <Route path='/index' element={<Index/>}/>
  //         <Route path='/orders' element={<Orders/>}/>
  //         <Route path='/categories' element={<Categories/>}/>
  //         <Route path='/suppliers' element={<Suppliers/>}/>
  //         <Route path='/products' element={<Products/>}/>
  //         <Route path='/customers' element={<Customers/>}/>
  //         <Route path='/employees' element={<Employees/>}/>
  //         {/* <Route path='/employees' element={<Employees/>}/> */}

  //         {/* NO MATCHING ROUTE */}
  //         <Route
  //         path='*'
  //         element={
  //           <main style={{padding: '1rem'}}>
  //             <p>404 Page not found 😂😂😂</p>
  //           </main>
  //         }
  //         >

  //         </Route>
  //       </Routes>
  //     </div>
  //    </BrowserRouter>
  //   </div>
  // );
}

export default App;
