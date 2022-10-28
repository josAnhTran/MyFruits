import React, { useEffect, useState } from "react";

import axios from "axios";

import {
  Button,
  Layout,
  Table,
  Form,
  Input,
  Popconfirm,
  message,
  notification,
  Modal,
  Upload,
} from "antd";
import { Content } from "antd/lib/layout/layout";
import {
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import TextArea from "antd/lib/input/TextArea";

import { URLCategory, WEB_SERVER_URL } from "../functions/constants";
import LabelCustomization from "./components/subComponents";

function Categories() {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [isChangedImage, setIsChangedImage] = useState(false);
  const [isChangeValueUpload, setIsChangeValueUpload] = useState(false);

  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();

  const urlIcon = "./imageIcons/icon03.png";

  const columns = [
    {
      title: () => {
        return <div style={{ paddingLeft: 8, fontWeight: 600 }}>Hình ảnh</div>;
      },
      key: "imageUrl",
      dataIndex: "imageUrl",
      width: "100px",
      render: (text) => {
        const style = {
          fontWeight: 600,
          paddingLeft: 8,
          width: "80px",
          height: "80px",
        };
        return (
          <div style={style}>
            <img
              src={text ? `${WEB_SERVER_URL}${text}` : "./images/noImage.jpg"}
              style={{ width: "100%", height: "100%" }}
              alt=""
            ></img>
          </div>
        );
      },
    },
    {
      title: () => {
        return (
          <div style={{ paddingLeft: 8, fontWeight: 600 }}>Tên Danh Mục</div>
        );
      },
      key: "name",
      dataIndex: "name",
      width: "15%",
      // fixed: 'left',
      // defaultSortOrder: 'ascend',
      sorter: (a, b) => a.name.length - b.name.length,
      render: (text) => {
        const style = {
          fontWeight: 600,
          paddingLeft: 8,
        };
        return <div style={style}>{text}</div>;
      },
    },

    {
      title: "Mô tả",
      key: "description",
      dataIndex: "description",
    },
    {
      title: () => {
        return <div style={{ paddingLeft: 8, fontWeight: 600 }}>Thao tác</div>;
      },
      key: "actions",
      width: "9%",
      fixed: "right",
      render: (record) => {
        return (
          <div
            style={{
              textAlign: "center",
              display: "flex",
              gap: 5,
              justifyContent: "center",
            }}
          >
            <Upload
              showUploadList={false}
              name="file"
              data={{ imageUrl: record.imageUrl ? record.imageUrl : null }}
              action={
                "http://localhost:9000/categoriesOnlineShopMongoose/updateOnlyImage/" +
                record._id
              }
              headers={{ authorization: "authorization-text" }}
              onChange={(info) => {
                if (info.file.status !== "uploading") {
                  console.log(info.file, info.fileList);
                }
                if (info.file.status === "done") {
                  setRefresh((e) => !e);
                  message.success(
                    `${info.file.name} được cập nhật thành công!`
                  );
                } else if (info.file.status === "error") {
                  message.error(`${info.file.name} file upload failed.`);
                }
              }}
            >
              <Button
                // type='primary'
                title="Cập nhật ảnh"
                icon={
                  <img
                    src={urlIcon}
                    width="32px"
                    height="32px"
                    alt="test"
                    background-color="green"
                  />
                }
                style={{ backgroundColor: "#1890ff" }}
              ></Button>
            </Upload>
            <Button
              icon={<EditOutlined />}
              type="primary"
              title="Chỉnh sửa"
              onClick={() => {
                const savedUrl = [
                  {
                    uid: "-1",
                    // name: 'IMG_0693.JPG',
                    status: "done",
                    url: `${WEB_SERVER_URL}${record.imageUrl}`,
                    thumbUrl: `${WEB_SERVER_URL}${record.imageUrl}`,
                  },
                ];

                setIsModalOpen(true);
                setSelectedId(record._id);
                setCurrentImageUrl(record.imageUrl ? record.imageUrl : null);
                setIsChangedImage(false);
                setIsChangeValueUpload(false);

                updateForm.setFieldsValue({
                  name: record.name,
                  description: record.description,
                  file: record.imageUrl ? savedUrl : [],
                });
              }}
            ></Button>
            <Popconfirm
              overlayInnerStyle={{ width: 300 }}
              title="Bạn muốn xóa không ?"
              okText="Đồng ý"
              cancelText="Đóng"
              onConfirm={(values) => {
                const { _id } = record;
                axios
                  .delete(URLCategory + "/delete-id/" + _id)
                  .then((response) => {
                    if (response.status === 200) {
                      setRefresh((e) => !e);
                      message.info("Xóa thành công");
                    }
                  });
              }}
            >
              <Button
                icon={<DeleteOutlined />}
                type="danger"
                style={{ fontWeight: 600 }}
                onClick={() => {}}
                title="Xóa"
              ></Button>
            </Popconfirm>
          </div>
        );
      },
    },
  ];
  //

  //Begin: Props for components
  const PropsTable = {
    style: { marginTop: 20 },
    rowKey: "_id",
    locale: {
      triggerDesc: "Giảm dần",
      triggerAsc: "Tăng dần",
      cancelSort: "Hủy sắp xếp",
    },
    bordered: true,
    size: "small",
    scroll: { x: 1500, y: 300 },
    title: () => {
      return (
        <div style={{ textAlign: "center", fontWeight: 600 }}>
          DANH SÁCH DANH MỤC HÀNG HÓA
        </div>
      );
    },
    footer: () =>
      "Nếu có vấn đề khi tương tác với hệ thống, xin vui lòng liên hệ số điện thoại 002233442",
  };

  const PropsForm = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
    initialValues: { name: "", description: "", file: null },
    autoComplete: "off",
  };

  const PropsFormItemName = {
    label: <LabelCustomization title={"Tên danh mục"} />,
    name: "name",
    rules: [
      {
        required: true,
        message: "Vui lòng nhập tên danh mục!",
      },
      {
        max: 50,
        message: "Tên danh mục không quá 50 kí tự!",
      },
    ],
    hasFeedback: true,
  };

  const PropsFormItemDescription = {
    label: <LabelCustomization title={"Mô tả danh mục"} />,
    name: "description",
    rules: [
      {
        max: 500,
        message: "Phần mô tả danh mục không quá 500 kí tự!",
      },
    ],
  };

  const PropsFormItemUpload = {
    label: <LabelCustomization title={"Hình ảnh"} />,
    name: "file",
    valuePropName: "fileList",
  };
  //End: Props for components

  const normFile = (e) => {
    setIsChangeValueUpload(true);
    if (Array.isArray(e)) {
      return e;
    }
    // setFile( e?.fileList.slice(-1))
    return e?.fileList.slice(-1);
  };
  //

  const handleOk = () => {
    updateForm.submit();
  };
  //

  const handleCancel = () => {
    setIsModalOpen(false);
    setFile(null);
  };
  //
  const handleFinishCreate = (values) => {
    //SUBMIT
    let formData = null;
    let newData = values;
    let URL = URLCategory + "/insertWithoutImage";

    //If containing an image <=> file !== null
    if (file) {
      URL = URLCategory + "/insertWithImage";

      formData = new FormData();
      formData.append("file", file);
      formData.append("name", values.name);
      formData.append("description", values.description);
      newData = formData;
    }

    //POST
    axios
      .post(URL, newData)
      .then((response) => {
        if (response.status === 201) {
          setRefresh((e) => !e);
          if (file) {
            setFile(null);
          }
          createForm.resetFields();
          notification.info({
            message: "Thông báo",
            description: "Thêm mới thành công",
          });
        }
      })
      .catch((error) => {
        const errorText = {
          name: error.response.data.error.name,
          message: error.response.data.error.message,
        };
        message.error(errorText.message)
        // notification.info({
        //   message: errorText.name,
        //   description: errorText.message,
        // });
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const handleFinishUpdate = (values) => {
    //SUBMIT
    let formData = null;
    let isChangedImageUrl = true;
    if (!isChangeValueUpload && !isChangedImage) {
      isChangedImageUrl = false;
    }
    let newData = {
      ...values,
      imageUrl: currentImageUrl,
      isChangedImageUrl: isChangedImageUrl,
    };
    let URL = URLCategory + "/updateByIdWithoutImage/" + selectedId;
    //If containing an image <=> file !== null
    if (file) {
      URL = URLCategory + "/updateByIdWithImage/" + selectedId;
      formData = new FormData();
      formData.append("file", file);
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("imageUrl", currentImageUrl);
      newData = formData;
    }
    //POST
    axios
      .patch(URL, newData)
      .then((response) => {
        if (response.status === 200) {
          setIsModalOpen(false);
          setRefresh((e) => !e);
          setSelectedId(null);
          setIsChangedImage(false);
          setIsChangeValueUpload(false);
          if (file) {
            setFile(null);
          }
          notification.info({
            message: "Thông báo",
            description: "Cập nhật thành công",
          });
        }
      })
      .catch((error) => {
        const errorText = {
          name: error.response.data.error.name,
          message: error.response.data.error.message,
        };
        notification.info({
          message: errorText.name,
          description: errorText.message,
        });
      })
      .finally(() => {
        setUploading(false);
      });
  };

  useEffect(() => {
    axios.get(URLCategory).then((response) => {
      setCategories(response.data.result);
    });
  }, [refresh]);
  //

  return (
    <Layout>
      <Content style={{ padding: 24 }}>
        <Form
          {...PropsForm}
          form={createForm}
          name="createForm"
          onFinish={handleFinishCreate}
          onFinishFailed={(error) => {
            console.error({
              name: "Error at onFinishFailed at CreateForm",
              message: error,
            });
          }}
        >
          <Form.Item {...PropsFormItemName}>
            <Input placeholder="Tên danh mục mới" />
          </Form.Item>

          <Form.Item {...PropsFormItemDescription}>
            <TextArea rows={3} placeholder="Mô tả danh mục mới" />
          </Form.Item>

          <Form.Item
            {...PropsFormItemUpload}
            //Handling update fileList
            getValueFromEvent={normFile}
          >
            <Upload
              listType="picture"
              showUploadList={true}
              beforeUpload={(file) => {
                setFile(file);
                return false;
              }}
              onRemove={(file) => {
                setFile(null);
              }}
            >
              <Button icon={<UploadOutlined />} loading={uploading}>
                Tải ảnh
              </Button>
            </Upload>
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
          {...PropsTable}
          columns={columns}
          dataSource={categories}
          pagination={false}
        />

        <Modal
          title="Chỉnh sửa thông tin danh mục"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          width={800}
        >
          <Form
            {...PropsForm}
            form={updateForm}
            name="updateForm"
            onFinish={handleFinishUpdate}
            onFinishFailed={(error) => {
              console.error({
                name: "Error at onFinishFailed at UpdateForm",
                message: error,
              });
            }}
          >
            <Form.Item {...PropsFormItemName}>
              <Input placeholder="Tên danh mục " />
            </Form.Item>

            <Form.Item {...PropsFormItemDescription}>
              <TextArea rows={3} placeholder="Mô tả danh mục " />
            </Form.Item>

            <Form.Item
              {...PropsFormItemUpload}
              //Handling update fileList
              getValueFromEvent={normFile}
            >
              <Upload
                listType="picture"
                showUploadList={true}
                beforeUpload={(file) => {
                  setIsChangedImage(true);
                  setFile(file);
                  return false;
                }}
                onRemove={(file) => {
                  setFile(null);
                }}
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  Tải ảnh
                </Button>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
}

export default Categories;
