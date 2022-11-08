import React, { useEffect, useState } from "react";
import "./css/CommonStyle.css";
import axios from "axios";
import moment from "moment";
import "moment/locale/vi";
import locale from "antd/es/locale/vi_VN";
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
  DatePicker,
} from "antd";
import { Content } from "antd/lib/layout/layout";
import {
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import TextArea from "antd/lib/input/TextArea";

import { URLEmployee, WEB_SERVER_URL } from "../functions/constants";
import LabelCustomization, {
  ImgIcon,
  BoldText,
  TitleTable,
} from "./components/subComponents";
import ConfigProvider from "antd/es/config-provider";

function Employees() {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [isChangedImage, setIsChangedImage] = useState(false);
  const [isChangeValueUpload, setIsChangeValueUpload] = useState(false);

  const [formCreate] = Form.useForm();
  const [formUpdate] = Form.useForm();
  const dateFormatList = ["DD/MM/YYYY", "DD/MM/YY"];

  const columns = [
    {
      title: () => {
        return <BoldText title={"Họ tên "} />;
      },
      key: "fullName",
      dataIndex: "fullName",
      width: "10%",
      fixed: "left",
      // defaultSortOrder: 'ascend',
      sorter: (a, b) => a.fullName.length - b.fullName.length,
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
        return <BoldText title={"Số điện thoại"} />;
      },
      key: "phoneNumber",
      dataIndex: "phoneNumber",
    },
    {
      title: () => {
        return <BoldText title={"Email"} />;
      },
      key: "email",
      dataIndex: "email",
    },
    {
      title: () => {
        return <BoldText title={"Năm sinh"} />;
      },
      key: "formattedBirthday",
      dataIndex: "formattedBirthday",
    },
    {
      title: () => {
        return <BoldText title={"Địa chỉ"} />;
      },
      key: "address",
      dataIndex: "address",
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
                "http://localhost:9000/employeesOnlineShopMongoose/updateOnlyImage/" +
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

  const disabledDate = (current) => {
    // Can not select days after 18 years ago
    return current >= moment().add(-18, "year");
  };
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

  const PropsFormItemFirstName = {
    label: <LabelCustomization title={"Họ"} />,
    name: "firstName",
    rules: [
      {
        required: true,
        message: "Vui lòng nhập họ và tên lót( nếu có) của nhân viên!",
      },
      {
        max: 50,
        message: "Trường dữ liệu không quá 50 kí tự!",
      },
      {
        whitespace: true,
        message: "Trường dữ liệu không thể là khoảng trống",
      },
    ],
  };
  const PropsFormItemLastName = {
    label: <LabelCustomization title={"Tên"} />,
    name: "lastName",
    rules: [
      {
        required: true,
        message: "Vui lòng nhập tên nhân viên!",
      },
      {
        max: 50,
        message: "Trường dữ liệu không quá 50 kí tự!",
      },
      {
        whitespace: true,
        message: "Trường dữ liệu không thể là khoảng trống",
      },
    ],
  };

  const PropsFormItemPhoneNumber = {
    label: <LabelCustomization title={"Số điện thoại"} />,
    name: "phoneNumber",
    rules: [
      {
        pattern: /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/,
        message: "Bạn chưa nhập đúng định dạng số điện thoại",
      },
      {
        max: 50,
        message: "Số điện thoại không quá 50 kí tự!",
      },
      {
        whitespace: true,
        message: "Số điện thoại không thể là khoảng trống",
      },
    ],
    onChange: (value) => {
      this.props.setValue(value);
    },
  };

  const PropsFormItemAddress = {
    label: <LabelCustomization title={"Địa chỉ"} />,
    name: "address",
    rules: [
      {
        required: true,
        message: "Vui lòng nhập địa chỉ của nhân viên!",
      },
      {
        max: 500,
        message: "Địa chỉ không quá 500 kí tự!",
      },
      {
        whitespace: true,
        message: "Địa chỉ không thể là khoảng trống",
      },
    ],
  };

  const PropsFormItemBirthday = {
    label: <LabelCustomization title={"Ngày sinh"} />,
    name: "birthday",
  };

  const PropsFormItemEmail = {
    label: <LabelCustomization title={"Email"} />,
    name: "email",
    rules: [
      {
        pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        message: "Bạn nhập chưa đúng định dạng email",
      },
      {
        max: 50,
        message: "Email không quá 50 kí tự!",
      },
      {
        required: true,
        message: "Vui lòng nhập email của nhân viên",
      },
    ],
    onChange: (value) => {
      this.props.setValue(value);
    },
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
    let fieldsValues = { file: record.imageUrl ? savedUrl : [] };
    for (let key in record) {
        fieldsValues[key] = record[key];
    }
    if(record.birthday){
      fieldsValues.birthday = moment(record.birthday )
    }
    else{
       fieldsValues.birthday =undefined
    }
    
    console.log(fieldsValues)
    formUpdate.setFieldsValue(fieldsValues);
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

    if (values.birthday) {
      values.birthday = values["birthday"].format("YYYY-MM-DD");
    } else {
      delete values.birthday;
    }
    let newData = { ...values };
    delete newData.file;

    let URL = URLEmployee + "/insertWithoutImage";
    //If containing an image <=> file !== null
    if (file) {
      URL = URLEmployee + "/insertWithImage";
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
        console.log(error);
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

    let URL = URLEmployee + "/updateByIdWithoutImage/" + selectedId;
    //If containing an image <=> file !== null
    if (file) {
      formData = new FormData();
      for (let key in values) {
        formData.append(key, values[key]);
      }
      formData.append("file", file);
      URL = URLEmployee + "/updateByIdWithImage/" + selectedId;
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
    axios.delete(URLEmployee + "/delete-id/" + _id).then((response) => {
      if (response.status === 200) {
        setRefresh((e) => !e);
        message.info("Xóa thành công");
      }
    });
  };

  useEffect(() => {
    axios.get(URLEmployee).then((response) => {
      const employees = response.data.results;
      let newEmployees = [];
      employees.map((e) => {
        // Formatting birthday before showing
        let formattedBirthday = null;
        if (e.birthday) {
          let array1 = e.birthday.split("T");
          let array2 = array1[0].split("-");
          let array3 = array2.reverse();
          formattedBirthday = array3.join("-");
        }
        newEmployees.push({
          ...e,
          formattedBirthday,
          fullName: `${e.firstName} ${e.lastName}`,
        });
      });
      setEmployees(newEmployees);
      setTotalDocs(newEmployees.length);
    });
  }, [refresh]);
  //

  return (
    <Layout>
      <Content style={{ padding: 24 }}>
        <ConfigProvider locale={locale}>
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
            <Form.Item {...PropsFormItemFirstName}>
              <Input placeholder="First name" />
            </Form.Item>

            <Form.Item {...PropsFormItemLastName}>
              <Input placeholder="Last name" />
            </Form.Item>

            <Form.Item {...PropsFormItemEmail}>
              <Input placeholder="Email" />
            </Form.Item>

            <Form.Item {...PropsFormItemPhoneNumber}>
              <Input placeholder="Số điện thoại của nhan vien" />
            </Form.Item>
            <Form.Item {...PropsFormItemBirthday}>
              <DatePicker
                allowClear={false}
                showToday={false}
                disabledDate={disabledDate}
                placeholder="dd/mm/yyyy"
                format={dateFormatList}
                locale={locale}
                renderExtraFooter={() => "Nhân viên đủ 18 tuổi trở lên"}
              />
            </Form.Item>
            <Form.Item {...PropsFormItemAddress}>
              <TextArea rows={3} placeholder="Dia chi nhan vien" />
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
        </ConfigProvider>

        <Table
          {...PropsTable}
          columns={columns}
          dataSource={employees}
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
            <Form.Item {...PropsFormItemFirstName}>
              <Input placeholder="First name" />
            </Form.Item>

            <Form.Item {...PropsFormItemLastName}>
              <Input placeholder="Last name" />
            </Form.Item>

            <Form.Item {...PropsFormItemEmail}>
              <Input placeholder="Email" />
            </Form.Item>

            <Form.Item {...PropsFormItemPhoneNumber}>
              <Input placeholder="Số điện thoại của nhan vien" />
            </Form.Item>
            <Form.Item {...PropsFormItemBirthday}>
              <DatePicker
                allowClear={false}
                showToday={false}
                disabledDate={disabledDate}
                placeholder="dd/mm/yyyy"
                format={dateFormatList}
                locale={locale}
                renderExtraFooter={() => "Nhân viên đủ 18 tuổi trở lên"}
              />
            </Form.Item>
            <Form.Item {...PropsFormItemAddress}>
              <TextArea rows={3} placeholder="Dia chi nhan vien" />
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

export default Employees;
