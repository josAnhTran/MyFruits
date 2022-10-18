import React from 'react'
import {Layout} from 'antd';
import { Content } from 'antd/lib/layout/layout';

function Suppliers() {
  return (
    <Layout>
      <Content>
        <form encType= 'multipart/form-data' action='http://localhost:9000/categoriesOnlineShopMongoose/uploadFile/63340e29540441d1b6f60c2e' method='post'>
          <input type='file' name = 'file' />
          <input type='text' name= 'message'/>
          <input type='submit' value='Upload Image' name='submit'/>
        </form>
      </Content>
    </Layout>
  )
}

export default Suppliers