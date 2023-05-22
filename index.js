#!/usr/bin/env -S node
const express=require('express');
const app=express();
const { SerialPort } = require('serialport');
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

app.get('/sw', asyncHandler(async (req, res) => {
	console.log("Got "+req.query.port+" as Target");
	const rret=await switch_it(req.query.port);
	console.log("RRet:"+rret);
	res.send(rret);
}));

port.on("data", (line) => {
	console.log("data from tty recvd: "+line.toString());
});

app.listen(8070, () => {
        console.log('listener started');
});
