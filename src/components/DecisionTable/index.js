import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import data from "./data.json";
import {
  Button,
  Col,
  Divider,
  Input,
  message,
  Row,
  Space,
  Table,
  Tooltip,
} from "antd";
import {
  InfoCircleOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

import "./style.css";

let rejectedList = [];
let acceptedList = [];
export default memo((props) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [openInput, setOpenInput] = useState(-1);

  useEffect(() => {
    return () => {
      acceptedList = [];
      rejectedList = [];
    };
  }, []);
  const hasSelected = selectedRowKeys.length > 0;
  const rowSelection = useMemo(() => {
    return {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        setSelectedRowKeys(selectedRowKeys);
      },
    };
  }, [selectedRowKeys]);

  const columns = useMemo(
    () => [
      {
        title: "Mobile",
        dataIndex: "mobile",
      },
      {
        title: "Earning ID",
        dataIndex: "earning_id",
      },
      {
        title: "Earnings",
        dataIndex: "earning",
        render: (text) => {
          return <span>&#8377;{text}</span>;
        },
      },
      {
        title: "Actions",
        colspan: 4,
        render: (text, record) => {
          return (
            <div style={{ maxWidth: "45%" }}>
              <Space size="middle">
                <Button
                  onClick={() => {
                    handleAcceptance(record);
                  }}
                  icon={<CheckCircleOutlined></CheckCircleOutlined>}
                  //   type="primary"
                >
                  Accept
                </Button>
                <Button
                  onClick={() => {
                    if (openInput === record.key) {
                      setOpenInput(-1);
                    } else {
                      setOpenInput(record.key);
                    }
                  }}
                  danger
                  icon={<CloseCircleOutlined></CloseCircleOutlined>}
                >
                  Reject
                </Button>
              </Space>

              {record.key == openInput && (
                <div style={{ margin: "8px 0px" }}>
                  <Input
                    onKeyPress={(e) => {
                      if (e.key == "Enter")
                        handleRejection(e.target.value, record);
                    }}
                    placeholder="Rejection Remark..."
                    style={{ maxWidth: "100%" }}
                    suffix={
                      <Tooltip title="Press Enter to Submit">
                        <InfoCircleOutlined
                          style={{ color: "rgba(0,0,0,.45)" }}
                        />
                      </Tooltip>
                    }
                  ></Input>
                </div>
              )}
            </div>
          );
        },
      },
    ],
    [openInput]
  );
  const displayLists = useCallback(() => {
    const displayList = acceptedList
      .concat(rejectedList)
      .map(({ key, ...rest }) => {
        return { ...rest };
      });
    console.log("Decision Log:", displayList);
    message.info("Check Console");
  }, []);
  const handleAcceptance = useCallback(
    (record) => {
      if (record.key == openInput) setOpenInput(-1);

      let docIndex = rejectedList.findIndex((doc) => doc.key == record.key);

      if (docIndex > -1) {
        rejectedList.splice(docIndex, 1);
      }
      docIndex = acceptedList.findIndex((doc) => doc.key == record.key);
      if (docIndex > -1) {
        message.info("Record already in accepted State");
      } else {
        acceptedList.push({
          ...record,
          action: "approve",
        });
        message.success("Record Accepted");
      }
    },
    [openInput]
  );
  const handleMultipleAcceptance = useCallback(() => {
    let records = data.filter((doc) => selectedRowKeys.includes(doc.key));
    records.forEach((record) => {
      if (record.key == openInput) setOpenInput(-1);
      let docIndex = acceptedList.findIndex((doc) => doc.key == record.key);
      if (docIndex == -1) {
        acceptedList.push({ ...record, action: "approve" });
      }
    });
    setSelectedRowKeys([]);
    message.success("Records Accepted");
  }, [selectedRowKeys, openInput]);
  const handleRejection = useCallback((remark, record) => {
    let docIndex = acceptedList.findIndex((doc) => doc.key == record.key);
    if (docIndex > -1) {
      acceptedList.splice(docIndex, 1);
    }
    docIndex = rejectedList.findIndex((doc) => doc.key == record.key);
    if (docIndex > -1) {
      rejectedList.splice(docIndex, 1);
    }
    rejectedList.push({ ...record, action: "reject", remark });
    message.success("Record Rejected");
    setOpenInput(-1);
  }, []);
  return (
    <>
      <Row justify="center" span={20}>
        <Col span={20}>
          <Table
            columns={columns}
            dataSource={data}
            rowSelection={rowSelection}
            title={() => {
              return (
                <>
                  <Button
                    type="primary"
                    disabled={!hasSelected}
                    onClick={handleMultipleAcceptance}
                  >
                    Accept Selected
                  </Button>
                  <span style={{ marginLeft: 8 }}>
                    {hasSelected && `Selected ${selectedRowKeys.length} items`}
                  </span>
                </>
              );
            }}
          ></Table>
        </Col>
      </Row>
      <Divider></Divider>

      <Row justify="center" gutter={[0, 24]}>
        <Col span={4}>
          <Button
            onClick={displayLists}
            type="primary"
            icon={<CheckOutlined />}
            size="large"
          >
            Verify
          </Button>
        </Col>
      </Row>
    </>
  );
});
