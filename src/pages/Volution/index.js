import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import Layout from '../../components/Layout';
import OCAPClient from '@arcblock/ocap-js';
import { fetchData, url } from '../../service';
// import ReactHighcharts from 'react-highcharts';
import RNN from './volution';
import Chart from '../Chart.js/Chart';
import './style.css';

const client = new OCAPClient({
  dataSource: "btc",
  // httpBaseUrl: 'http://47.104.23.85:8080/api', // for dev in china
  // httpBaseUrl: 'https://ocap.arcblock.io/api', // for production
  enableSubscription: true,
  enableMutation: false,
});

class Volution extends Component {

  state = {
    d: 0,
    z: 0,
    blocksData: [],
    btcPriceData: [],
    blocksTxsData: [],
    blocksTotalData: [],
    blocksIndex: null
  }
  async componentDidMount() {
    await this.getBtcPriceAndFormatData();
    let result = await this.getBlocksData()
    if(result){
      let data =  this.formatVolutionData()
      let output = this.calculateOutput(this.state.btcPriceData.slice(144))
      RNN.input(data, output);
      RNN.listen(function(status) {
        console.log(status);
      })
      setInterval(() => {
        let btcPriceData = this.state.btcPriceData.filter((value,index) => index % 2 === 0)
        btcPriceData = btcPriceData.map((item) => item[1])
        let blocksTotalData = this.state.blocksTotalData.map((item) => item[1])
        let blocksTxsData = this.state.blocksTxsData.map((item) => item[1])
        let result = RNN.run({
          0: btcPriceData.slice(24),
          1: blocksTotalData.slice(24),
          2: blocksTxsData.slice(24),
         })
        this.setState({
          // result: JSON.stringify(result),
          d: result.d,
          z: result.z
        })
        console.log(RNN.run({
          0: btcPriceData.slice(24),
          1: blocksTotalData.slice(24),
          2: blocksTxsData.slice(24),
         }))
        }, 1000);
    }
    this.refreshBlocks();
  }
  componentWillUpdate(){
    return false
  }
  
  getBtcPriceAndFormatData = async() => {
    let now = new Date().getTime();
    let start = now - 3600000 * 28;
    await fetchData(url.getPast7DayBtcPrice + "&start=" + start + "&end=" + now, this.setData)
  }
  // getBlocksAndFormatData = async() => {
  //   let blockchainInfo = await client.blockchainInfo({instance: "main"});
  //   let end = blockchainInfo.blockchainInfo.latestHeight;
  //   this.setState({
  //     blocksIndex: end
  //   })
  //   let start = end - 168;
  //   let origin = [];
  //   let blocksTxsData = [];
  //   let blocksTotalData = [];
  //   // let btcPriceData = [];
  //   console.log(client)
  //   let res = await client.blocksByHeight({
  //     fromHeight: start
  //   })
  //   origin = origin.concat(res.blocksByHeight.data)
  //   for(let i = 0; i < 16; i++){
  //     res = await res.blocksByHeight.next();
  //     origin = origin.concat(res.blocksByHeight.data)
  //   }
    
  //   origin.map((item, index) => {
  //     let time = new Date(item.time).getTime()
  //     blocksTxsData.push([time, item.numberTxs])
  //     blocksTotalData.push([time, item.total/100000000])
  //   })
  //   this.setState({
  //     blocksData: origin,
  //     blocksTxsData,
  //     blocksTotalData
  //   })
  // }
  
  setData = (res) => {
    // console.log(res.data.map((item) => item[0]))
    // let btcPriceData = res.data.filter((item, index) => index % 2);
    // console.log(btcPriceData)
    this.setState({
      btcPriceData: res.data
    })
  }

  formatData = (data) => {
    let blocksTxsData = [];
    let blocksTotalData = [];
    data.map((item, index) => {
      let time = new Date(item.time).getTime()
      blocksTxsData.push([time, item.numberTxs])
      blocksTotalData.push([time, item.total/100000000])
    })
    this.setState({
      blocksTxsData,
      blocksTotalData
    })
  }

  refreshBlocks = () => {
    this.timer = setInterval(() => {
      console.log("hello")
      let result = this.getBlocksData()
      if(result){
        let data =  this.formatVolutionData()
        let output = this.calculateOutput(this.state.btcPriceData.slice(144))
        RNN.input(data, output)
      }
    }, 100000)
  }

  formatVolutionData = () => {
    let btcPriceData = this.state.btcPriceData.filter((value,index) => index % 2 === 0)
    btcPriceData = btcPriceData.map((item) => item[1])
    let blocksTotalData = this.state.blocksTotalData.map((item) => item[1])
    let blocksTxsData = this.state.blocksTxsData.map((item) => item[1])
    return {
      0: btcPriceData.slice(0, 144),
      1: blocksTotalData.slice(0, 144),
      2: blocksTxsData.slice(0, 144),
    }
  }

  getBlocksData = async() => {
    let blockchainInfo = await client.blockchainInfo({instance: "main"});
    let latest = blockchainInfo.blockchainInfo.latestHeight;

    if(latest !== this.state.blocksIndex){
      let origin = []
      let res = await client.blocksByHeight({
        fromHeight: this.state.blocksIndex ? this.state.blocksIndex : latest - 167
      })
      origin = origin.concat(res.blocksByHeight.data)
      while(res.blocksByHeight.data){
        if(!res.blocksByHeight.next){break}
        res = await res.blocksByHeight.next();
        origin = origin.concat(res.blocksByHeight.data)
      }
      let len = origin.length;
      let data = this.state.blocksData.slice(len).concat(origin);
      this.formatData(data)
      this.setState({
        blocksIndex: latest,
        blocksData: data
      })

      return true
    }
    return false
  }

  calculateOutput(d) {
    let start = d.shift()
    let end = d.pop();
    return (end-start)/Math.sqrt((end-start)**2+24**2)>0?{d:0,z:1}:{d:1, z:0};
  }
  render() {

    return (
      <Layout>
        <div style={{padding: 40}}>
          <Chart btcPriceData={this.state.btcPriceData} blocksTxsData={this.state.blocksTxsData} blocksTotalData={this.state.blocksTotalData}/>
          <div>{this.state.result}</div>
          <h3>未来4小时</h3>
          <div>涨的概率：{this.state.z * 100} %</div>
          <div>跌的概率：{this.state.d * 100} %</div>
        </div>
      </Layout>
    );
  }
}

export default withRouter(Volution);
