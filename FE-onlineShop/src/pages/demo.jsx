import React from 'react';
import { Layout, message, Upload, Button } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

export default function ManualAntUpload() {
  const [file, setFile] = React.useState(null);

  return (
    <Layout>
      <Content style={{ padding: 12 }}>
        <Upload
          showUploadList={true}
          beforeUpload={(file) => {
            setFile(file);
            return false;
          }}
        >
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>

        <Button
          onClick={(values) => {
            console.log({test: values});
            return;
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', 'Category 1234');
            formData.append('description', 'Mo ta 1234');
// console.log(formData.values)
// return;
            axios.post('http://localhost:9000/categoriesOnlineShopMongoose/uploadFile/632c4b02ec2ad3757f85c06a', formData).then((response) => {
              console.log({data: response.data});
            });
          }}
        >
          Submit
        </Button>
      </Content>
    </Layout>
  );
}
