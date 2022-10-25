import React, { useEffect, useState } from 'react'

import axios, { AxiosError } from 'axios';

import {
  Button, Layout, Table, Form, Input,
  Popconfirm, message, notification,
  Modal,
  Upload
  } from 'antd';
import {Content} from 'antd/lib/layout/layout';
import {DeleteOutlined, EditOutlined, UploadOutlined} from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';

import { URLCategory, WEB_SERVER_URL } from '../functions/constants';

function Categories() {

  const columns =[
    {
      title: (() => {
        return <div style={{paddingLeft: 8, fontWeight: 600}}>Hình ảnh</div>
      }),
      key: 'imageUrl',
      dataIndex: 'imageUrl',
      width: '100px',
      render: (text) => {
        const style = {
          fontWeight: 600,
          paddingLeft: 8,
          width: '80px',
          height: '80px'
        }
        if(!text) {
          text='/images/noImage.jpg'
        }
        return <div style={style}>
        <img src={`${WEB_SERVER_URL}${text}`} style={{width: '100%', height: '100%'}} alt=''></img>
        </div>
      }
    },
    {
      title: (() => {
        return <div style={{paddingLeft: 8, fontWeight: 600}}>Tên Danh Mục</div>
      }),
      key: 'name',
      dataIndex: 'name',
      width: '15%',
      // fixed: 'left',
      // defaultSortOrder: 'ascend',
      sorter: (a, b) => a.name.length - b.name.length,
      render: (text) => {
        const style = {
          fontWeight: 600,
          paddingLeft: 8,
        }
        return <div style={style}>{text}</div>
      }
    },
    
    {
      title: 'Mô tả',
      key: 'description',
      dataIndex: 'description',
    },
    {
      title: (() => {
        return <div style={{paddingLeft: 8, fontWeight: 600}}>Thao tác</div>
      }),
      key: 'actions',
      width: '9%',
      fixed: 'right',
      render: (record) => {
        return (
          <div 
          style={{textAlign: 'center',display: 'flex',
          gap: 5,justifyContent: 'center'}}
          >
            <Upload
               showUploadList = {false}
               name='file'
              //  data= {{message: 'Testing upload file '}}
               action = {'http://localhost:9000/categoriesOnlineShopMongoose/uploadFile/' + record._id}
               headers= {{authorization: 'authorization-text'}}
               onChange= {(info) =>{
                   if(info.file.status !== 'uploading'){
                       console.log(info.file, info.fileList);
                   }
                   if(info.file.status === 'done'){
                      setRefresh(e =>!e)
                       message.success(`${info.file.name} được cập nhật thành công!`);
                   } else if(info.file.status === 'error') {
                 message.error(`${info.file.name} file upload failed.`);
                   }
               }}
           >
           <Button 
            // type='primary'
            title='Cập nhật ảnh'  
            icon={ <img src= {urlIcon} width='32px' height='32px' alt='test' background-color='green'/>}

            style={{backgroundColor: '#1890ff'}}
            >
             
            </Button>
           </Upload>
            <Button
            icon={<EditOutlined />}
            type='primary' 
            title='Chỉnh sửa'
            onClick= {() => {

              const savedUrl1 = [{
                uid: '-1',
                // name: 'file-1666626683993.jpeg',
                status: 'done',
                url:`${WEB_SERVER_URL}${record.imageUrl}`,
                thumbUrl: `${WEB_SERVER_URL}${record.imageUrl}`
                }]


              setIsModalOpen(true)
              setSelectedId(record._id)
              setSavedUrl((e) => {
                //If the category doesn't have field imageUrl
                if(! record.imageUrl) {
                  return ;
                }
                //else
                const savedUrl = [{
                uid: '-1',
                // name: 'file-1666626683993.jpeg',
                status: 'done',
                url:`${WEB_SERVER_URL}${record.imageUrl}`,
                thumbUrl: `${WEB_SERVER_URL}${record.imageUrl}`
                }]
                return savedUrl
                })
              updateForm.setFieldsValue({
                'name': record.name,
                 'description': record.description, 
                //  'file' : record.imageUrl ? `${WEB_SERVER_URL}${record.imageUrl}`: 'no image'
                 'file': record.imageUrl ? savedUrl1: []
                 })
            }}
            >
            </Button>
            <Popconfirm 
              overlayInnerStyle={{width: 300}}
              title='Bạn muốn xóa không ?' 
              okText= 'Đồng ý'
              cancelText= 'Đóng'
              onConfirm={() =>{
                const {_id} = record
                  axios.delete(URLCategory+ '/delete-id/' + _id)
                  .then(response => {
                    if(response.status === 200) {
                      setRefresh(e=> !e)
                      message.info('Xóa thành công')
                    }
                  })
              }}
            >
              <Button
                icon={<DeleteOutlined />}
                type='danger' style={{fontWeight: 600}}
                onClick= {() => {}}
                title='Xóa'
              >
              </Button>
            </Popconfirm>
          </div>
       
        )
      }
    }
  ]

  const[ uploading, setUploading] = useState(false)
  const [file, setFile] = useState(null)
  const [fileList, setFileList] = useState([])
  const [savedUrl, setSavedUrl] = useState([])
  const [categories, setCategories] = useState([])
  const [refresh, setRefresh] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  const [createForm] = Form.useForm()
  const [updateForm] = Form.useForm()

  const urlIcon= './imageIcons/icon03.png'

  const normFile =(e) =>{
    if(Array.isArray(e)){
      return e;
    }
    // setFile(e?.fileList.slice(-1));
    return e?.fileList.slice(-1);
  }

  const handleOk  = () =>{
    updateForm.submit()
  }
  const handleCancel = () => {
    setIsModalOpen(false)
  }

  useEffect(()=>{
    axios.get(URLCategory)
    .then(response => {
     setCategories(response.data.result)
    })
  },[refresh])
  return (
    <Layout>
    <Content style={{padding: 24}}>
    <Form
      form={createForm}
      name="createForm"
      labelCol={{
        span: 4,
      }}
      wrapperCol={{
        span: 16,
      }}
      initialValues={{
        name: "",
        description: ''
      }}
      onFinish={(values) => {
        //SUBMIT
        let formData = null;
        let newData = values;
       
       //If containing an image <=> file !== null
        if(file) {
        formData = new FormData();
        formData.append('file', file);
        formData.append('name', values.name);
        formData.append('description', values.description);
        newData = formData;
        }
        

        let URL =  URLCategory + '/insertWithoutImage'
        if(file) {
        URL =  URLCategory +'/insertWithImage'
        }
        //POST
        axios.post( URL, newData)
        .then(response => {
          if(response.status === 201) {
            setRefresh(e => !e)
            if(file) {
                setFile(null)
            }
            createForm.resetFields()
            notification.info({message: 'Thông báo', description: 'Thêm mới thành công'})
          }
        })
        .catch(() =>{
          message.error('Tải hình ảnh thất bại.');
        })
        .finally(() =>{
          setUploading(false);
        })
      }}
      onFinishFailed={(error) => {
        console.error(error)
      }}
      autoComplete="off"
     >
      <Form.Item
        label="Tên danh mục"
        name="name"
        rules={[
          {
            required: true,
            message: 'Vui lòng nhập tên danh mục!',
          },
        ]}
        style={{fontWeight: 600}}
        hasFeedback
      >
        <Input placeholder='Tên danh mục mới'/>
      </Form.Item>

      <Form.Item
        label="Mô tả danh mục mới"
        name="description"
        style={{fontWeight: 600}}

      >
        <TextArea rows={3} placeholder='Mô tả danh mục mới'/>
      </Form.Item>
      
      <Form.Item 
        valuePropName = 'imageUrl'
        label='Hình minh họa' name='file'
        style={{fontWeight: 600}}
        >
        <Upload
          listType = 'picture'
          showUploadList ={true}
          beforeUpload= {(file) =>{
            setFile(file);
            return false;
          }}
          maxCount= {1}
        >
          <Button icon= {<UploadOutlined/>} 
          loading={uploading}
          >Tải ảnh</Button>
        </Upload>
      </Form.Item>

      <Form.Item
        wrapperCol={{
          offset: 4,
          span: 16,
        }}
      >
        <Button type="primary" htmlType="submit">
          Tạo mới
        </Button>
      </Form.Item>
    </Form>
    <Table 
    style={{marginTop: 20}} 
    rowKey='_id' 
    columns={columns} 
    dataSource={categories} 
    pagination ={false}
    locale={{ 
          triggerDesc: 'Giảm dần',
          triggerAsc: 'Tăng dần', 
          cancelSort: 'Hủy sắp xếp'
      }}
    bordered
    size='small'
    // scroll={{x:1300, y: 400}}
    scroll={{ y: 300, x:1500}}
    title={() => {
      return <div style={{textAlign:'center', fontWeight: 600}}>DANH SÁCH DANH MỤC HÀNG HÓA</div>
    }}
    footer={() => 'Nếu có vấn đề khi tương tác với hệ thống, xin vui lòng liên hệ số điện thoại 002233442'}
    />

    <Modal 
      title="Chỉnh sửa thông tin danh mục" 
      open={isModalOpen} 
      onOk={handleOk} 
      onCancel={handleCancel}
      width= {800}
    >
      <Form
        form={updateForm}
        name="updateForm"
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 24,
        }}
        initialValues={{
          name: "",
          description: '',
          file: ''
        }}
        onFinish={(values) => {
          //SUBMIT
          let formData = null;
          let newData = values;
       //If containing an image <=> file !== null
       if(file) {
        formData = new FormData();
        formData.append('file', file);
        formData.append('name', values.name);
        formData.append('description', values.description);
        newData = formData;
        }
        let URL =  URLCategory + '/insertWithoutImage'
        if(file) {
        URL =  URLCategory +'/insertWithImage'
        }
        //POST

        
          // try{
            axios.patch( URLCategory +'/updateById/' + selectedId, values)
          .then(response => {
            if(response.status === 200) {
              // console.log(response.data)
              setIsModalOpen(false)
              setRefresh(e => !e)
              notification.info({message: 'Thông báo', description: 'Cập nhật thành công'})
            }
          })
          // } 
          .catch((error) => {
            const errorText = {name: error.response.data.error.name, 
                              message : error.response.data.error.message
                            }
            notification.info({message: errorText.name, description: errorText.message})
              console.log(errorText)
          })
        }}
        onFinishFailed={(error) => {
          console.error(error)
        }}
        autoComplete="off"
      >
        <Form.Item
          label="Tên danh mục"
          name="name"
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập tên danh mục!',
            },
          ]}
          style={{fontWeight: 600}}
          hasFeedback
        >
          <Input placeholder='Tên danh mục mới'/>
        </Form.Item>

        <Form.Item
          label="Mô tả danh mục mới"
          name="description"
          style={{fontWeight: 600}}

        >
          <TextArea rows={3} placeholder='Mô tả danh mục mới'/>
        </Form.Item>

        <Form.Item 
          // valuePropName = 'defaultFileList'
          valuePropName = 'fileList'
          label='Hình minh họa'
          name='file'
          style={{fontWeight: 600}}
          //Handling update fileList
          getValueFromEvent= {normFile}
          >
          <Upload
            listType = 'picture'
            showUploadList ={true}
            beforeUpload= {(file) =>{
              setFile(file);
            
              return false;
            }}
            // maxCount= {1}
            // fileList={fileList}
          >
            <Button icon= {<UploadOutlined/>} 
            loading={uploading}
            >Tải ảnh</Button>
          </Upload>
        </Form.Item>

      </Form>
      </Modal>
    </Content>
    </Layout>
  )
}

export default Categories