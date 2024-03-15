import {hex_md5} from './md5'

export let CV = {
	baseUrl : "https://cv01.panaccess.com",
	mode : 'json',
	jsonpTimeout: 5000,
	sessionId : null,
	init : function(options) {

		if (options['baseUrl'] != null && options['baseUrl'] != undefined)
			this.baseUrl = options.baseUrl;
		
		if (options['mode'] != null && options['mode'] != undefined)  {
			switch (options.mode) {
				case 'json' :
				case 'jsonp' : this.mode = options.mode; break;
				default : throw "Unsupported mode: Only json and jsonp are supported"			
			}
		}
		
		if (this.mode == 'jsonp') {
			if (options['jsonpTimeout'] != null && options['jsonpTimeout'] != undefined)
				this.jsonpTimeout = options.jsonpTimeout;			
		}
		
		this.username = options.username;
		this.password = options.password;
		this.apiToken = options.apiToken;
		var salt = '_panaccess';
		
		if (typeof hex_md5 == 'function' && salt != null && salt != undefined) {
			var hashReg = /^[0-9a-f]{32}$/;
			if (!hashReg.test(this.password )) {
				//Hashing password
				this.password  += salt;
				this.password = hex_md5(this.password );
			}
		}			
		
		var oldOnError = window.onerror;
		window.onerror = function(message, url, linenumber) {

			//alert(message +" "+ url +" "+ linenumber);
			if (url.includes("CVJSONP")) {
				
				var regEx = /^.*(CVJSONP[0-9]*).*$/;
				
				var match = regEx.exec(url);
				if (match) {
					
					var jsonpFuncName = match[1];
					if (window[jsonpFuncName] != undefined && window[jsonpFuncName] != null) {
					
						var result = [];
						result["success"] = false;
						result["errorCode"] = "unknown_error";
						result["errorMessage"] = "The JSONP Call failed. Most likely the Server response was invalid and could not be parsed: "+message;
					
						window[jsonpFuncName](result);
					}
				
				}
				
				return true;
				
			}
			
			if (oldOnError) 
				oldOnError.apply(this, arguments);
			
			return false;
		};
		
		
		
		this.login(this.apiToken, this.username, this.password, options.loginSuccessCallback, options.loginFailedCallback);
	},
	callId : 0,
	
	serialize : function(obj, prefix) {
		var str = [];
		for(var p in obj) {
			if (obj.hasOwnProperty(p)) {
				var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
				str.push(typeof v == "object" ?	this.serialize(v, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v));
			}
		}
		return str.join("&");
	},
	
	callJsonp : function(url) {
		var head = document.head;
		var script = document.createElement("script");

		script.setAttribute("src", url);
		
		head.appendChild(script);
		head.removeChild(script);
	},
	call : function (funcName, parameters, callback) {
		var callId = this.callId++;
		
		var url = this.baseUrl+"?f=" + funcName + "&requestMode=function";

		if (this.sessionId !== null && funcName != 'login')
			parameters['sessionId'] = this.sessionId;
		
		
		if (this.mode == 'jsonp') {		
			
			var jsonpFuncName = 'CVJSONP'+callId;			
			var timedOut = false;
					
			var timeoutMillis = this.jsonpTimeout;
			
			var timeout = setTimeout(function() {
				timedOut = true;
				delete window[jsonpFuncName];
				
				var result = [];
				result["success"] = false;
				result["errorCode"] = "timeout";
				result["errorMessage"] = "The request timed out! Current timeout settings are set to "+timeoutMillis+" milliseconds.\nTo increase the timeout specify the jsonpTimeout parameter in the init options.";
				
				if (callback != null && callback != undefined)
					callback(result);
				
			}, this.jsonpTimeout);
			
			
			window[jsonpFuncName] = function(result) { 

				delete window[jsonpFuncName];
				
				clearTimeout(timeout);
				
				if (!timedOut) {
					callback(result);
				}
			}
			
			parameters['jsonp'] = "window."+jsonpFuncName;
			var paramString = CV.serialize(parameters);
			
			var head = document.head;
			var script = document.createElement("script");

			script.setAttribute("src", url+"&"+paramString);
			
			head.appendChild(script);
			head.removeChild(script);
			
			
		}
		else {
			var paramString = CV.serialize(parameters);
			
			var xmlhttp = new XMLHttpRequest();
			
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState == 4) {
					if (xmlhttp.status == 200) {
						var result = JSON.parse(xmlhttp.responseText);
						callback(result);
					}
					else {
						var result = [];
						result["success"] = false;
						result["errorCode"] = "unknown_error";
						result["errorMessage"] = "("+xmlhttp.status+") An unknown error did occur!";
						if (callback != null && callback != undefined)
							callback(result);
					}
				}
			};
			
			xmlhttp.open("POST", url, true);
			xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xmlhttp.send(paramString);
			
			return xmlhttp;
		}
	},
	
	login : function(apiToken, username, password, callbackSuccess, callbackFailure) {
		var t = this;
		this.call(
			"login", 
			{ 
				apiToken: apiToken,
				username: username, 
				password: password
			}, 
			function(result) {
				if (result['success']) {
					var sessionId = result['answer'];
					if (sessionId === null 
						|| sessionId === undefined 
						|| sessionId === "" 
						|| sessionId === false
						|| sessionId === "false"
						|| (Object.prototype.toString.call( sessionId ) === '[object Array]' && sessionId.length == 0)) {
						
						t.sessionId = null;
						callbackFailure("Username or password wrong");
					}
					else {
						t.sessionId = sessionId;
						callbackSuccess();
					}
				}
				else {
					callbackFailure(result['errorMessage']);
				}
			}
		);
	},
	
	logout : function() {
		this.call(
			"clientLogout", 
			{ }			
		);
	}
};

