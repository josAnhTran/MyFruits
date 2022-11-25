import { PlusOutlined } from '@ant-design/icons';
import { Button, Modal, Upload } from 'antd';
import axios from 'axios';
import React, { useState } from 'react';
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
const UpListPictures = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [fileList, setFileList] = useState([
   
  ]);
  const handleCancel = () => setPreviewOpen(false);
  const handlePreview = async (file) => {
    console.log(file)
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };
  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList)};
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </div>
  );
  const [uploading, setUploading] = useState(false);
  const handleUpload = () => {
    let tmp =[]
    let formData = new FormData();
    fileList.forEach((file) => {
      formData.append('files', file.originFileObj)
    //   console.log({file})
    //   formData.append('pictures', {
    //     name: file.fileName,
    //     file: file.image,
    //     type: file.type,
    //   });
    });
    console.log({tmp})
    // formData.append('name', '124')
    // formData.append('files', tmp)
    setUploading(true);
    // console.log({fileList});
const data = formData
console.log('show: ', data)
    // return;
    const url ='http://localhost:9000/upListPicturesOnlineShopMongoose/uploadList/34345435435'
    axios.post(url, data)
    .then(response => {
      if(response.status=== 200){
        console.log({response})
      }else{
        console.log('something wrong')
      }
    })
    .catch(err => {
      console.error({err})
    })
    .finally(() => {
          setUploading(false);
        });
    // You can use any AJAX library you like
    // fetch('https://www.mocky.io/v2/5cc8019d300000980a055e76', {
    //   method: 'POST',
    //   body: formData,
    // })
    //   .then((res) => res.json())
    //   .then(() => {
    //     setFileList([]);
    //     .success('upload successfully.');
    //   })
    //   .catch(() => {
    //     message.error('upload failed.');
    //   })
    //   .finally(() => {
    //     setUploading(false);
    //   });
  };
  const props = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };
  return (
    <>
      <Upload
      {...props}
        // action="http://localhost:9000/upListPicturesOnlineShopMongoose/uploadList/34345435435"
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        // name='myFiles'
      >
        {fileList.length >= 3 ? null : uploadButton}
      </Upload>
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0}
        loading={uploading}
        style={{
          marginTop: 16,
        }}
      >
        {uploading ? 'Uploading' : 'Start Upload'}
      </Button>
      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
        <img
          alt="example"
          style={{
            width: '100%',
          }}
          src={previewImage}
        />
      </Modal>
    </>
  );
};
export default UpListPictures;
