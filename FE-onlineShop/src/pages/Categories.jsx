import React, { useEffect, useState } from 'react'

import axios, { AxiosError } from 'axios';

import {
  Button, Layout, Table, Form, Input,
  Popconfirm, message, Space, notification,
  Modal,
  Upload
  } from 'antd';
import {Content} from 'antd/lib/layout/layout';
import {DeleteOutlined, EditOutlined, UploadOutlined} from '@ant-design/icons';

import { URLCategory, WEB_SERVER_URL } from '../functions/constants';
import TextArea from 'antd/lib/input/TextArea';

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
        }
        if(!text) {
          text='/images/noImage.jpg'
        }
        return <div style={style}>
        <img src={`${WEB_SERVER_URL}${text}`} style={{width: '100%'}} alt=''></img>
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
      width: '12%',
      // fixed: 'right',
      render: (record) => {
        return (
          <div 
          style={{textAlign: 'center',display: 'flex',
          gap: 5,justifyContent: 'center'}}
          >
            <Upload
               showUploadList = {false}
               name='file'
               data= {{message: 'Testing upload file '}}
               action = {'http://localhost:9000/categoriesOnlineShopMongoose/uploadFile/' + record._id}
               headers= {{authorization: 'authorization-text'}}
               onChange= {(info) =>{
                   if(info.file.status !== 'uploading'){
                       console.log(info.file, info.fileList);
                   }
                   if(info.file.status === 'done'){
                      setRefresh(e =>!e)
                       message.success(`${info.file.name} file uploaded successfully`);
                   } else if(info.file.status === 'error') {
                 message.error(`${info.file.name} file upload failed.`);
                   }
               }}
           >
           <Button icon={<UploadOutlined />} type='primary'  />
           </Upload>
            <Button
            icon={<EditOutlined />}
            type='primary' 
            onClick= {() => {
              setIsModalOpen(true)
              setSelectedId(record._id)
              updateForm.setFieldsValue({'name': record.name, 'description': record.description})
              // updateForm.setFieldValue('name', record.name)
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
              >
              </Button>
            </Popconfirm>
          </div>
       
        )
      }
    }
  ]

  const [categories, setCategories] = useState([])
  const [refresh, setRefresh] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  const [createForm] = Form.useForm()
  const [updateForm] = Form.useForm()

  const handleOk  = () =>{
    updateForm.submit()
  }
  const handleCancel = () => {
    setIsModalOpen(false)
  }

  useEffect(()=>{
    axios.get(URLCategory)
    .then(response => {
     setCategories(response.data)
    })
  },[refresh])
  return (
    <Layout>
    <Content style={{padding: 24}}>
    <Form
      form={createForm}
      name="createForm"
      labelCol={{
        span: 8,
      }}
      wrapperCol={{
        span: 16,
      }}
      initialValues={{
        name: "",
        description: ''
      }}
      onFinish={(values) => {
        //POST
        axios.post( URLCategory +'/insert', values)
        .then(response => {
          if(response.status === 201) {
            setRefresh(e => !e)
            createForm.resetFields()
            notification.info({message: 'Thông báo', description: 'Thêm mới thành công'})
          }
        })
        console.log(values)
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
        wrapperCol={{
          offset: 8,
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
    scroll={{ y: 300}}
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
    >
    <Form
      form={updateForm}
      name="updateForm"
      labelCol={{
        span: 8,
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
        <Input placeholder='Mô tả danh mục mới'/>
      </Form.Item>
    </Form>
      </Modal>
    </Content>
    </Layout>
  )
}

export default Categories