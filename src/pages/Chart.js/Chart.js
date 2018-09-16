import React, { PureComponent } from 'react';
import ReactHighcharts from 'react-highcharts';

class Chart extends PureComponent{
    render(){
        return (
        <ReactHighcharts
                noReflow={false}
                style={{padding: 20}}
                config={{
                    title: "BTC 区块科技",
                    xAxis: {
                        type: 'datetime',
                        labels: {
                            rotation: -50,
                            align: 'right',
                            formatter: function() {
                                let date = new Date(this.value);
                                let month = date.getMonth() + 1;
                                let hours = date.getHours();
                                hours = hours > 9 ? hours : "0" + hours;
                                let min = date.getMinutes();
                                min = min > 9 ? min : "0" + min;
                                month = month > 9 ? month : "0" + month;
                                let date1 = date.getDate();
                                date1 = date1 > 9 ? date1 : "0" + date1;
                                if(min != 0){
                                    return ""
                                }

                                return month + "-" + date1 + " " + hours + ":" + min
                            }
                        },
                        tickInterval: 1                                        
                    },
                    tooltip: {
                        shared: false,
                        crosshairs: true,
                        plotOptions: {
                            spline: {
                                marker: {
                                    radius: 4,
                                    lineColor: '#666666',
                                    lineWidth: 1
                                }
                            }
                        }
                    },
                    yAxis: [{
                        opposite: true,
                        offset: 0,
                        title: {
                        text: "btc价格(美元)",
                        offset: 0
                        }
                    },{
                        title: {
                        text: "区块交易笔数",
                        },
                        labels: {
                        rotation: -30
                        }
                    },{
                        title: {
                        text: "区块交易总额(个btc)",
                        },
                        labels: {
                        rotation: -30
                        }
                    }],
                    credits:{
                        enabled: false // 禁用版权信息
                    },
                    time: {
                        useUTC: true
                    },
                    series: [{
                        name: "比特币价格",
                        yAxis: 0,
                        data: this.props.btcPriceData
                    },{
                        name: "区块交易比数",
                        yAxis: 1,
                        data: this.props.blocksTxsData
                    },{
                        name: "区块交易总额",
                        yAxis: 2,
                        data: this.props.blocksTotalData
                    }],
                }}/>
        )
    }
}

export default Chart;