import React, {Component} from 'react';
import './Monitor.css';
import ReactEcharts from 'echarts-for-react'
import Layout from "antd/lib/layout/layout";
import {Col, Descriptions, Row, Table} from "antd"
import {wsServer} from "../../common/env";
import {getToken} from "../../utils/utils";
import {message} from "antd/es";

import qs from "qs";


const {Content} = Layout

// Demo
class StatusMonitor extends Component {

    state = {
        webSocket: undefined,
        baseInfo: {},
        memoryInfo: [{}],
        dockerInfo: {},
        netWorkInfo: {}

    }

    constructor(props) {
        super(props)
        this.state.id = props.match.params.id

    }

    componentDidMount() {
        let param = {
            'X-Auth-Token': getToken()
        }
        console.log(wsServer + '/monitor/' + this.state.id + "?" + qs.stringify(param))
        let webSocket = new WebSocket(wsServer + '/monitor/' + this.state.id + "?" + qs.stringify(param));
        this.setState({
            webSocket: webSocket
        })
        let pingInterval;
        webSocket.onopen = (e => {
            pingInterval = setInterval(() => {
                webSocket.send("status")
            }, 5000);
        });

        webSocket.onerror = (e) => {
            message.error("Failed to connect to server.");
        }
        webSocket.onclose = (e) => {
            if (pingInterval) {
                clearInterval(pingInterval);
            }
        }
        webSocket.onmessage = (e) => {
            let data = JSON.parse(e.data)
            console.log(data)
            let CpuInfo = []
            if (this.state.memoryInfo.length < 10) {
                CpuInfo=this.state.memoryInfo
                CpuInfo.push(data["base_info"])
            }
            this.setState({
                baseInfo: data["base_info"],
                memoryInfo: CpuInfo,
                dockerInfo: data["docker"],
                netWorkInfo: data['net_work'],
                upTime: data['base_info']['uptime'],
                onlineUser: data['base_info']["online_user"]
            })
            console.log(this.state)
        }
    }


    componentWillUnmount() {
        let webSocket = this.state.webSocket;
        if (webSocket) {
            webSocket.close()
        }
    }


    render() {
        let baseOption = {
            title: {
                text: 'CPU使用率'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['用户', '系统', '总量']
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
            },
            yAxis: {
                type: 'value',
                max: 100
            },
            series: [
                {
                    name: '用户',
                    type: 'line',
                    stack: '用户',
                    data: [20, 32, 1, 34, 9, 23, 21]
                },
                {
                    name: '系统',
                    type: 'line',
                    stack: '系统',
                    data: [40, 10, 20, 40, 30, 33, 32]
                },
                {
                    name: '总量',
                    type: 'line',
                    stack: '总量',
                    data: [60, 32, 21, 74, 39, 56, 53]
                }

            ]
        };
        const memoryOption = {
            title: {
                text: '内存使用分布',
                left: 'center'
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
            },
            series: [
                {
                    name: '内存分布',
                    type: 'pie',
                    radius: '50%',
                    data: [
                        {value: 1048, name: '用户'},
                        {value: 735, name: '系统'},
                        {value: 580, name: '空闲'},
                    ],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 1)'
                        }
                    }
                }
            ]
        };

        const netWorkOption = {
            title: {
                text: '网络流量',
                left: 'center'
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
            },
            series: [
                {
                    name: '内存分布',
                    type: 'pie',
                    radius: '50%',
                    data: [
                        {value: 1048, name: '发送', itemStyle: {"color": "#087cd2"}},
                        {value: 735, name: '接收', itemStyle: {"color": "#7ce0a0"}},
                    ],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 1)'
                        }
                    }
                }
            ]
        };

        const containerColumns = [
            {
                title: '容器ID',
                dataIndex: 'container_id',
                key: 'container_id',
            },
            {
                title: '容器名称',
                dataIndex: 'container_name',
                key: 'container_name',
            },
            {
                title: 'CPU',
                dataIndex: 'cpu_pre',
                key: 'cpu_pre',
            },
            {
                title: '内存情况',
                dataIndex: 'mem_usage_limit',
                key: 'mem_usage_limit',
            }
        ];
        const containerData = [
            {
                "container_id": "3d651ab404cb",
                "container_name": "next-terminal",
                "cpu_pre": "0.10%",
                "mem_usage_limit": "95.74 MiB / 7.638 GiB"
            }, {
                "container_id": "177e2e15be02",
                "container_name": "k8s_kube-scheduler_kube-scheduler-k8s-master_kube-system_1550c620c1fcf6b52e24352a2f6d899e_9",
                "cpu_pre": "0.26%",
                "mem_usage_limit": "14.89 MiB / 7.638 GiB"
            }, {
                "container_id": "70980e93908f",
                "container_name": "k8s_etcd_etcd-k8s-master_kube-system_d40f2c29b74a0cb2ecde9864ba0284d4_8",
                "cpu_pre": "1.12%",
                "mem_usage_limit": "56.11 MiB / 7.638 GiB"
            }, {
                "container_id": "bebeeffa0de2",
                "container_name": "k8s_kube-controller-manager_kube-controller-manager-k8s-master_kube-system_06f86d57119ab927854bae68a140a585_8",
                "cpu_pre": "0.75%",
                "mem_usage_limit": "40.05 MiB / 7.638 GiB"
            }, {
                "container_id": "26b32088e815",
                "container_name": "k8s_kube-apiserver_kube-apiserver-k8s-master_kube-system_c6fd5c60cfb20bd2a706d63360289fa3_8",
                "cpu_pre": "2.34%",
                "mem_usage_limit": "278.9 MiB / 7.638 GiB"
            }, {
                "container_id": "754b350e370c",
                "container_name": "k8s_kube-proxy_kube-proxy-tq52n_kube-system_f16571eb-741b-43cf-ac5f-0ca4a4b8f75e_7",
                "cpu_pre": "0.03%",
                "mem_usage_limit": "12.74 MiB / 7.638 GiB"
            }, {
                "container_id": "8159d31df5a0",
                "container_name": "k8s_POD_kube-apiserver-k8s-master_kube-system_c6fd5c60cfb20bd2a706d63360289fa3_9",
                "cpu_pre": "0.00%",
                "mem_usage_limit": "44 KiB / 7.638 GiB"
            }, {
                "container_id": "09f558fe1fa2",
                "container_name": "k8s_POD_etcd-k8s-master_kube-system_d40f2c29b74a0cb2ecde9864ba0284d4_9",
                "cpu_pre": "0.00%",
                "mem_usage_limit": "36 KiB / 7.638 GiB"
            }, {
                "container_id": "bb89e0ddbfb8",
                "container_name": "k8s_POD_kube-controller-manager-k8s-master_kube-system_06f86d57119ab927854bae68a140a585_10",
                "cpu_pre": "0.00%",
                "mem_usage_limit": "40 KiB / 7.638 GiB"
            }, {
                "container_id": "4f4a33e5322e",
                "container_name": "k8s_POD_kube-proxy-tq52n_kube-system_f16571eb-741b-43cf-ac5f-0ca4a4b8f75e_7",
                "cpu_pre": "0.00%",
                "mem_usage_limit": "40 KiB / 7.638 GiB"
            }, {
                "container_id": "2344287de2c9",
                "container_name": "k8s_POD_kube-scheduler-k8s-master_kube-system_1550c620c1fcf6b52e24352a2f6d899e_9",
                "cpu_pre": "0.00%",
                "mem_usage_limit": "40 KiB / 7.638 GiB"
            }, {
                "container_id": "e6e10aa53add",
                "container_name": "github-runner",
                "cpu_pre": "0.00%",
                "mem_usage_limit": "14.3 MiB / 7.638 GiB"
            }, {
                "container_id": "723e477c7385",
                "container_name": "teaser_codimd_1",
                "cpu_pre": "0.02%",
                "mem_usage_limit": "80.58 MiB / 7.638 GiB"
            }, {
                "container_id": "d27b78c5ff4b",
                "container_name": "teaser_database_1",
                "cpu_pre": "0.00%",
                "mem_usage_limit": "2.734 MiB / 7.638 GiB"
            }]

        return (
            <>
                <Content>
                    <Row gutter={5} justify="start" style={{padding: 18}}>
                        <Col>
                            <Descriptions title="系统信息">
                                <Descriptions.Item label="开机时长">{this.state.upTime}</Descriptions.Item>
                                <Descriptions.Item label="在线用户">{this.state.onlineUser}</Descriptions.Item>

                            </Descriptions>
                        </Col>

                    </Row>
                    <Row justify="left" gutter={18} style={{padding: 18}}>

                        <Col span={12}>
                            <ReactEcharts
                                style={{height: 300, width: 500, padding: 10}}
                                notMerge={true}
                                lazyUpdate={true}
                                option={memoryOption}/>

                        </Col>
                        <Col span={12}>
                            <ReactEcharts
                                style={{height: 300, width: 500, padding: 10}}
                                notMerge={true}
                                lazyUpdate={true}
                                option={netWorkOption}/>

                        </Col>
                    </Row>
                    <Row justify="center" style={{paddingTop: 10}}>
                        <Col span={20}>
                            <div className="Status">
                                <ReactEcharts
                                    style={{height: 300, width: 1000, padding: 10}}
                                    notMerge={true}
                                    lazyUpdate={true}
                                    option={baseOption}/>
                            </div>
                        </Col>

                    </Row>

                    <Table columns={containerColumns}
                           dataSource={containerData}
                           pagination={false}
                           style={{padding: 18}}/>
                </Content>

            </>
        );
    }
}

export default StatusMonitor;
