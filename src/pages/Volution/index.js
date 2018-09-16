import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import Layout from '../../components/Layout';
import Chart from '../Chart.js/Chart';
import OCAPClient from '@arcblock/ocap-js';
import { fetchData, url } from '../../service';
import RNN from './volution';

const client = new OCAPClient({
  dataSource: "btc",
  enableSubscription: true,
  enableMutation: false,
});
// const inputHours = 24;
// const outputHours = 4;

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
      RNN.listen(function(status) {
        console.log(status);
      })
      this.resetInputOutputData()
    }
    this.listenToRefreshBlocks();
  }
  componentWillUpdate(){
    return false
  }
  resetInputOutputData = () => {
    console.log("重置RNN的输入")
    let data =  this.formatVolutionData()
    let output = this.calculateOutput(this.state.btcPriceData.slice(144))
    RNN.input(data, output);
    this.timer2 = setInterval(() => {
      let btcPriceData = this.state.btcPriceData.filter((value,index) => index % 2 === 0)
      btcPriceData = btcPriceData.map((item) => item[1])
      let blocksTotalData = this.state.blocksTotalData.map((item) => item[1])
      let blocksTxsData = this.state.blocksTxsData.map((item) => item[1])
      let result = RNN.run({
        0: btcPriceData.slice(24),
        1: blocksTotalData.slice(24),
        2: blocksTxsData.slice(24),
       })
      //  console.log(result)
      this.setState({
        d: result.d,
        z: result.z
      })
      }, 1000);
  }
  getBtcPriceAndFormatData = async() => {
    let now = new Date().getTime();
    let start = now - 3600000 * 28;
    await fetchData(url.getPastBtcPrice + "&start=" + start + "&end=" + now, this.setPriceData)
  }
  
  setPriceData = (res) => {
    this.setState({
      btcPriceData: res.data
    })
  }

  getBlocksData = async() => {
    let blockchainInfo = await client.blockchainInfo({instance: "main"});
    let latest = blockchainInfo.blockchainInfo.latestHeight;

    if(latest != this.state.blocksIndex){
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
      this.formatBlocksData(data)
      this.setState({
        blocksIndex: latest,
        blocksData: data
      })

      return true
    }
    return false
  }

  formatBlocksData = (data) => {
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

  listenToRefreshBlocks = () => {
    this.timer1 = setInterval(async() => {
      console.log("监听新的区块中")
      let result = this.getBlocksData()
      if(result){
        console.log("监听到新的区块")
        clearInterval(this.timer2)
        await this.getBtcPriceAndFormatData();
        this.resetInputOutputData()
      }else{
        console.log("没有监听到新的区块")
      }
    }, 100000)
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
          <div style={styles.container}>
            <h3>未来4小时</h3>
            <div style={{display: "flex"}}>
              <div style={{...styles.container, width: 200}}>
                <div style={{...styles.cycle, ...styles.green}}>涨</div>
                <div>{this.state.z * 100} %</div>
              </div>
              <div style={styles.progressContainer}>
                <div style={{...styles.progress, backgroundColor: "green", width: 200 * this.state.z, position: "relative"}}>
                  {
                    this.state.d !== 0 ? <div style={styles.tag}></div> : null
                  }
                </div>
                <div style={{...styles.progress, backgroundColor: "red", width: 200 * this.state.d}}></div>
              </div>
              <div style={{...styles.container, width: 200}}>
                <div style={{...styles.cycle, ...styles.red}}>跌</div>
                <div>{this.state.d * 100} %</div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  cycle: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: 100,
    fontSize: 30,
    fontWeight: "bold",
    borderRadius: 100,
  },
  green: {
    color: "green",
    border: "2px solid green"
  },
  red: {
    color: "red",
    border: "2px solid red"
  },
  progressContainer: {
    width: 200,
    display: "flex",
    alignItems: "center",
    // marginTop: 90
  },
  progress: {
    height: 20,
    float: "left"
  },
  tag: {
    position: "absolute",
    bottom: -10,
    right: -5,
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderWidth: "0 5px 10px 5px",
    borderColor: "transparent transparent #007bff transparent"
  }
}

export default withRouter(Volution);
