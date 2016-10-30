/**
 * This node is copyright (c) Peter Scargill - but as I've had so many ideas from others -
 * consider it free to use for whatever purpose you like. If you redesign it
 * please remember to drop my name and link in there somewhere.
 * http://tech.scargill.net This software puts out one of two messages on change
 * of state which could be sent to the MQTT node, tests every minute and can be
 * manually over-ridden
 */

module.exports = function(RED) {
	"use strict";
	var SunCalc = require('suncalc');
		
	function myTimerNode(n) {
		RED.nodes.createNode(this, n);
		var node = this;
		this.dawnminoff = parseInt(n.dawnminoff);
		this.dawnplusoff = parseInt(n.dawnplusoff);	
		this.dawnweekday = parseInt(n.dawnweekday);
		this.dawnweekend = parseInt(n.dawnweekend);
		this.duskminoff = parseInt(n.duskminoff);
		this.duskplusoff = parseInt(n.duskplusoff);	
		this.duskweekday = parseInt(n.duskweekday);
		this.duskweekend = parseInt(n.duskweekend);
		var dayx = 0;	
		var dawnmin1 = 0;
		var dawnmin2 = 0;
		var duskmin1 = 0;
		var duskmin2 = 0;
		var intime = 0;
		var intimestate = "off";
		var msg={};
								
		node.on("input",function(inmsg) {
		        if(inmsg.payload) {
			        intime = inmsg.payload.time.split(':')[0]*60 + inmsg.payload.time.split(':')[1]*1;
			        intimestate = inmsg.payload.state;
                        }
			var now = new Date();
			var day = now.getDate();
			var minu = now.getHours()*60+now.getMinutes();
			if (day!=dayx) {	//firts invoke or start of a new day: calculate and reset
				node.warn("new day")
				var times = SunCalc.getTimes(now, n.lat, n.lon);
				dawnmin1=times.sunrise.getHours()*60+times.sunrise.getMinutes();
				duskmin1=times.sunset.getHours()*60+times.sunset.getMinutes();
                                var weekend = false;
                                if (now.getDay() == 0 || now.getDay() == 6)
                                {
                                        weekend = true;
                                }
                                if (weekend)
                                {
                                        node.warn("weekend");
				        if (dawnmin1 > node.dawnweekend) {
					        dawnmin2 = dawnmin1 + Math.floor(Math.random() * (node.dawnplusoff + node.dawnminoff)) - node.dawnminoff;
                                        }
				        else {
				                dawnmin2 = node.dawnweekend + Math.floor(Math.random() * (node.dawnplusoff + node.dawnminoff)) - node.dawnminoff;
                                        }
				        if (duskmin1 < node.duskweekend) {
					        duskmin2 = duskmin1 + Math.floor(Math.random() * (node.duskplusoff + node.duskminoff)) - node.duskminoff;
                                        }
				        else {
				                duskmin2 = node.duskweekend + Math.floor(Math.random() * (node.duskplusoff + node.duskminoff)) - node.duskminoff;
                                        }
                                }
                                else {
                                        node.warn("weekday");
				        if (dawnmin1 > node.dawnweekday) {
					        dawnmin2 = dawnmin1 + Math.floor(Math.random() * (node.dawnplusoff + node.dawnminoff)) - node.dawnminoff;
                                        }
				        else {
				                dawnmin2 = node.dawnweekday + Math.floor(Math.random() * (node.dawnplusoff + node.dawnminoff)) - node.dawnminoff;
                                        }
				        if (duskmin1 < node.duskweekday) {
					        duskmin2 = duskmin1 + Math.floor(Math.random() * (node.duskplusoff + node.duskminoff)) - node.duskminoff;
                                        }
				        else {
				                duskmin2 = node.duskweekday + Math.floor(Math.random() * (node.duskplusoff + node.duskminoff)) - node.duskminoff;
                                        }
                                }
        			dayx=day;        			
			}
       			if (minu == dawnmin1) {
       			        var x ={};
       			        x.daylight = "on";
       			        msg.payload = JSON.stringify(x);
       			        node.send(msg);
       			}
       			if (minu == dawnmin2) { 
       			        var y ={};
       			        y.daytime = "on";
       			        msg.payload = JSON.stringify(y);
       			        node.send(msg);
       			}
       			if (minu == duskmin1) {
       			        var x = {};
       			        x.daylight = "off";
       			        msg.payload = JSON.stringify(x);
       			        node.send(msg);
       			}
       			if (minu == duskmin2) { 
       			        var y = {};
       			        y.daytime = "off";
       			        msg.payload = JSON.stringify(y);
       			        node.send(msg);
       			}
       			if (minu == intime && intimestate == "on") {
                                var y = {};
       			        y.alarm = "on";
                                msg.payload = JSON.stringify(y);
                                node.send(msg);
                        }
       			                                                                                                                                                        
			
		});  // end of the internal function

		var tock = setTimeout(function() {
			node.emit("input", {});
		}, 2000); // wait 2 secs before starting to let things settle down -
					// e.g. UI connect

		var tick = setInterval(function() {
			node.emit("input", {});
		}, 60000); // trigger every 60 secs

		node.on("close", function() {
			if (tock) {
				clearTimeout(tock);
			}
			if (tick) {
				clearInterval(tick);
			}
		});

	}
	RED.nodes.registerType("mytimer", myTimerNode);
}
