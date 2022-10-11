import React, { useEffect } from 'react'
import {Button, Layout} from 'antd';
import {Content} from 'antd/lib/layout/layout';
import axios from 'axios';
import { URLCategory } from '../functions/constants';

function Categories() {
  useEffect(()=>{
    axios.get(URLCategory)
    .then(response => {
      console.log(response.data)
    })
  },[])
  return (
    <Layout>
    <Content>
    <Button type='primary'>OK</Button>

    </Content>
    </Layout>
  )
}

export default Categories