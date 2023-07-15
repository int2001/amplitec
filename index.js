#!/usr/bin/env -S node
const express=require('express');
const app=express();
const { SerialPort } = require('serialport');
var antenna=0;
var port = new SerialPort(
	{
		path: "/dev/ttyACM0",
		baudRate: 19200,
		dataBits: 8,
		stopBits: 1,
		parity: "none",
	},
	false
);

const asyncHandler = (fun) => (req, res, next) => {
	  Promise.resolve(fun(req, res, next))
	    .catch(next)
};

const switch_it = (tport) => {
	return new Promise((resolve) => {
		let command = new Uint8Array([0x01, 0x02, 0x57, 0x30+Number(tport), 0x0D]);
		var ret='';
		const buff = Buffer.from(command);
		port.write(buff, function (err) {
			if (err) {
				ret='{"error":"'+err.message+'"}';
				reject(ret);
			}
			ret='{"success":"true"}';
			resolve(ret);
		});
		port.flush();
	});
};

app.use("/",express.static('static'));

app.get('/ant', asyncHandler(async (req, res) => {
	ret='{"antenna":'+antenna+'}';
	res.send(ret);
}));

app.get('/sw', asyncHandler(async (req, res) => {
	const rret=await switch_it(req.query.port);
	res.send(rret);
}));

var buffer = '';
port.on('data', function(chunk) {
	buffer += chunk;
	var answers = buffer.split(/\r?\n/); // Split data by new line character or smth-else
		buffer = answers.pop(); // Store unfinished data

	if (answers.length > 0) {
		antenna=(answers[0].substr(answers[0].indexOf("R=")+2,1));
	}
});

app.listen(8070, () => {
        console.log('listener started at port 8070');
});
