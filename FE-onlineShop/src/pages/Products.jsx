import React from 'react'
import { Layout, message, Upload, Button } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { UploadOutlined } from '@ant-design/icons';

function Products() {
    return (
      <Layout>
       <Content  style={{padding: 12}}>
           <Upload
               showUploadList = {false}
               name='file'
               data= {{message: 'Testing upload file '}}
               action = 'http://localhost:9000/categoriesOnlineShopMongoose/uploadFile/63340e29540441d1b6f60c2e'
               headers= {{authorization: 'authorization-text'}}
               onChange= {(info) =>{
                   if(info.file.status != 'uploading'){
                       console.log(info.file, info.fileList);
                   }
                   if(info.file.status === 'done'){
                       message.success(`${info.file.name} file uploaded successfully`);
                   } else if(info.file.status === 'error') {
                 message.error(`${info.file.name} file upload failed.`);
                   }
               }}
           >
           <Button icon={<UploadOutlined />}>Click to Upload File</Button>
           </Upload>
       </Content>
      </Layout>
     )
   }

export default Products