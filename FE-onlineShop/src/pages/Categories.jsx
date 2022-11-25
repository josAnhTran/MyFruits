import React, { useEffect, useState } from "react";
import "./css/CommonStyle.css";
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

import {
  URLCategory,
  WEB_SERVER_URL,
  PATH_CATEGORIES,
} from "../functions/constants";
import LabelCustomization, {
  ImgIcon,
  BoldText,
  TitleTable,
} from "./components/subComponents";
import axiosClient from "../config/axios";
import ReduxExamples from "./ReduxExamples";

function Categories() {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [isChangedImage, setIsChangedImage] = useState(false);
  const [isChangeValueUpload, setIsChangeValueUpload] = useState(false);

  const [formCreate] = Form.useForm();
  const [formUpdate] = Form.useForm();

  const columns = [
    {
      title: () => {
        return <BoldText title={"Danh mục "} />;
      },
      key: "name",
      dataIndex: "name",
      width: "10%",
      fixed: "left",
      // defaultSortOrder: 'ascend',
      sorter: (a, b) => a.name.length - b.name.length,
      render: (text) => {
        return <BoldText title={text} />;
      },
    },
    {
      title: () => {
        return <BoldText title={"Hình ảnh"} />;
      },
      key: "imageUrl",
      dataIndex: "imageUrl",
      width: "100px",
      render: (text) => {
        return (
          <div className="loadImg">
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
        return <BoldText title={"Mô tả"} />;
      },
      key: "description",
      dataIndex: "description",
    },
    {
      title: () => {
        return <BoldText title={"Thao tác"} />;
      },
      key: "actions",
      width: "9%",
      fixed: "right",
      render: (record) => {
        return (
          <div className="divActs">
            <Upload
              method="PATCH"
              showUploadList={false}
              name="file"
              action={
                "http://localhost:9000/categoriesOnlineShopMongoose/updateOnlyImage/" +
                record._id
              }
              headers={{ authorization: "authorization-text" }}
              onChange={(info) => handleChange_UploadOnlyImage(info)}
            >
              <Button
                title="Cập nhật ảnh"
                icon={<ImgIcon />}
                style={{ backgroundColor: "#1890ff" }}
              ></Button>
            </Upload>
            <Button
              icon={<EditOutlined />}
              type="primary"
              title="Chỉnh sửa"
              onClick={() => handleClick_EditBtn(record)}
            ></Button>
            <Popconfirm
              overlayInnerStyle={{ width: 300 }}
              title="Bạn muốn xóa không ?"
              okText="Đồng ý"
              cancelText="Đóng"
              onConfirm={() => handleConfirmDelete(record._id)}
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
    scroll: { x: 1500, y: 400 },
    title: () => {
      return <TitleTable title="danh sách danh mục hàng hóa" />;
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
      {
        whitespace: true,
        message: "Tên danh mục không thể là khoảng trống",
      },
    ],
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
    return e?.fileList.slice(-1);
  };
  //

  const handleOk = () => {
    formUpdate.submit();
  };
  //

  const handleCancel = () => {
    setIsModalOpen(false);
    setFile(null);
  };
  //
  const handleClick_EditBtn = (record) => {
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
    const fieldsValues = { file: record.imageUrl ? savedUrl : [] };
    for (let key in record) {
      fieldsValues[key] = record[key];
    }
    formUpdate.setFieldsValue(fieldsValues);

    // formUpdate.setFieldsValue({
    //   name: record.name,
    //   description: record.description,
    //   file: record.imageUrl ? savedUrl : [],
    // });
  };
  //
  const handleChange_UploadOnlyImage = (info) => {
    if (info.file.status !== "uploading") {
    }
    if (info.file.status === "done") {
      setRefresh((e) => !e);
      message.success(`${info.file.name} được cập nhật thành công!`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file cập nhật thất bại.`);
    }
  };
  //
  const handleFinishCreate = (values) => {
    //SUBMIT
    let formData = null;
    let newData = { ...values };
    delete newData.file;

    let URL = URLCategory + "/insertWithoutImage";
    //If containing an image <=> file !== null
    if (file) {
      URL = URLCategory + "/insertWithImage";
      formData = new FormData();
      for (let key in values) {
        formData.append(key, values[key]);
      }
      formData.append("file", file);
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
          formCreate.resetFields();
          notification.info({
            message: "Thông báo",
            description: "Thêm mới thành công",
          });
        }
      })
      .catch((error) => {
        message.error(
          error.response.data.error.message
            ? error.response.data.error.message
            : error
        );
      })
      .finally(() => {
        setUploading(false);
      });
  };
  //
  const handleFinishUpdate = (values) => {
    //SUBMIT
    let formData = null;
    let isChangeImgUrl = true;
    if (!isChangeValueUpload && !isChangedImage) {
      isChangeImgUrl = false;
    }
    let newData = {
      ...values,
      imageUrl: currentImageUrl,
      isChangeImgUrl,
    };
    delete newData.file;

    let URL = URLCategory + "/updateByIdWithoutImage/" + selectedId;
    //If containing an image <=> file !== null
    if (file) {
      formData = new FormData();
      for (let key in values) {
        formData.append(key, values[key]);
      }
      formData.append("file", file);
      URL = URLCategory + "/updateByIdWithImage/" + selectedId;
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
        message.error(
          error.response.data.error.message
            ? error.response.data.error.message
            : error
        );
      })
      .finally(() => {
        setUploading(false);
      });
  };
  //
  const handleConfirmDelete = (_id) => {
    axios.delete(URLCategory + "/delete-id/" + _id).then((response) => {
      if (response.status === 200) {
        setRefresh((e) => !e);
        message.info("Xóa thành công");
      }
    });
  };

  useEffect(() => {
    axiosClient.get(`${WEB_SERVER_URL}${PATH_CATEGORIES}`).then((response) => {
      setCategories(response.data.results);
      setTotalDocs(response.data.results.length);
    });

    // axios.get(URLCategory).then((response) => {
    //   setCategories(response.data.results);
    //   setTotalDocs(response.data.results.length);
    // });
  }, [refresh]);
  //

  return (
    <Layout>
      <Content style={{ padding: 24 }}>
      <ReduxExamples/>
        <Form
          {...PropsForm}
          form={formCreate}
          name="formCreate"
          onFinish={handleFinishCreate}
          onFinishFailed={() => {
            // message.info("Error at onFinishFailed at formCreate");
            console.error("Error at onFinishFailed at formCreate");
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
              onRemove={() => {
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
          pagination={{
            total: totalDocs,
            showTotal: (totalDocs, range) =>
              `${range[0]}-${range[1]} of ${totalDocs} items`,
            defaultPageSize: 10,
            defaultCurrent: 1,
          }}
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
            form={formUpdate}
            name="formUpdate"
            onFinish={handleFinishUpdate}
            onFinishFailed={() => {
              // message.info("Error at onFinishFailed at formUpdate");
              console.error("Error at onFinishFailed at formUpdate");
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
                onRemove={() => {
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
