import brain from 'brain.js';
import _ from "lodash";

// provide optional config object, defaults shown.
const config = {
	binaryThresh: 0.5, // ¯\_(ツ)_/¯
	hiddenLayers: [3, 20], // array of ints for the sizes of the hidden layers in the network
	activation: 'sigmoid' // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh']
};

// 初始化神经网络配置
const net = new brain.NeuralNetwork(config);

// 训练option设置
const option = {
	// Defaults values --> expected validation
	iterations: 10000, // the maximum times to iterate the training data --> number greater than 0
	errorThresh: 0.000005, // the acceptable error percentage from training data --> number between 0 and 1
	log: false, // true to use console.log, when a function is supplied it is used --> Either true or a function
	logPeriod: 10, // iterations between logging out --> number greater than 0
	learningRate: 0.3, // scales with delta to effect training rate --> number between 0 and 1
	momentum: 0.1, // scales with next layer's change value --> number between 0 and 1
	callback: null, // a periodic call back that can be triggered while training --> null or function
	callbackPeriod: 10, // the number of iterations through the training data between callback calls --> number greater than 0
	timeout: Infinity, // the max number of milliseconds to train for --> number greater than 0
	callback: function(layers, status) {
		// console.log(layers.length)
	}
}

// 定义输入模型
// 30 1-10 因素1 10-20 因素2 20-30 因素3






/**
 * ipt = {
 * 	x: [],
 * 	y:[]
 * }
 *
 * opt = {
 * 	result: <斜率>
 * }
 * @param  {[type]} ipt [description]
 * @param  {[type]} opt [description]
 * @return {[type]}     [description]
 */


let len = new Array(432).fill(0);
let iptsLenLimit = 10; // inputs 缓存池大小限定
let inputs = [];
let maxsize = 1000;

let RNN = {
};

RNN.status = 1;

RNN.fromJSON = function(json) {
	net.fromJSON(json);
}

RNN.input = async function (ipt, opt) {
	ipt = Object.keys(ipt).reduce((res, key) => {
		len.map((v, i) => res[key + i] = ipt[key][i] || 0);
		return res;
	}, {});

	if (inputs.length > iptsLenLimit) {
		inputs.shift();
	}

	inputs.push({ input: ipt, output: opt });
	// console.log(inputs)
	this.status = 0;
	// 遍历直到最优模型
	while (true) {
		let res = await net.trainAsync(inputs, option);
		if (res.iterations !== option.iterations) {
			this.status = 1;
			break;
		}
	}
	return true;
}

RNN.run = function (ipt) {
	ipt = Object.keys(ipt).reduce((res, key) => {
		len.map((v, i) => res[key + i] = ipt[key][i] || 0);
		return res;
	}, {});
	return net.run(ipt);
}

RNN.listen = function (cb) {
	option.callback = cb;
}

RNN.toJSON = function () {
	return net.toJSON();
}

export default RNN;


//测试

// let _inputs = [{ input: { r: [1000.03, 0.03, 0.03], g: [0.7, 0.7, 0.7], b: [0.5, 0.5, 0.5] }, output: { result: 0 } },
// 	{ input: { r: [0.16, 0.16, 0.16], g: [0.09, 0.09, 0.09], b: [0.2, 0.2, 0.2] }, output: { result: 0.5 } },
// 	{ input: { r: [0.5, 0.5, 0.5], g: [0.5, 0.5, 0.5], b: [1.0, 1.0, 1.0] }, output: { result: 1} }
// ];

// RNN.listen(function(layers, status){
// 	console.log(status)
// })

// _inputs.map((v) => {
// 	RNN.input(v.input, v.output);
// });


// console.log(RNN.run(_inputs[1].input));
