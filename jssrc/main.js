const SITE_NAME = "NAME";
const PORT = "9000";
const IP = "ec2-13-232-236-137.ap-south-1.compute.amazonaws.com"

const GREEN = "#00dd44",WHITE = "#ffffff";
const BACK_GRAY = "#777777",RED = "#ff4400";
const BLUE = "#0055bb",PINK="#ff0044";
const CYAN = "#00ccee",GRAY = "gray";
const LIKE_BTN_COL = "#ff033e";

const GET_PROF_DATA    = "P";
const GET_BASIC_DATA   = "B";
const GET_SOC_REL_DATA = "S+";
const GET_FEED_HANDLER = "F";
const GET_SUPP_DATA    = "s";

//acc types
const PUBL = "p",PRIV = "P";

var HomeContent="",MeContent = "";

var rightnav,topnav,base

username = localStorage.getItem("user");
localStorage.setItem("user",null);

$ = args => {
	return document.getElementById(args)
}


gen = args => {
	return document.createElement(args)
}

empty = arg => {
	if (conn != undefined) {
		conn.close()
	}
	arg.innerHTML = ""
}

refreshJS = () => {
	localStorage.setItem("user",username);
	console.log("refjs")
	window.open("main.htm",'_self');
	//load('main.htm');
}

async function hidePerm(arg){
	if ($(arg) != null) {
		$(arg).style.animationPlayState = "paused";

		$(arg).style.opacity = "0";
		await sleep(500);
		$(arg).remove();
	}
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}


load = async args => {
	window.open(args,'_self');

	/*var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			$("body").innerHTML = this.responseText;
		}
	};
	xhttp.open("GET",args, true);
	xhttp.send();*/
}

initPrereq = () => {
	$("title").textContent = SITE_NAME;
	var socket = new WebSocket('ws://'+IP+':'+PORT);
	var user_data1,user_data2

	if (!window.WebSocket) {
		alert("Your browser does not support web sockets");
	}

	socket.onerror = function(error) {
		//alert("Connection error either the server or you are offline");
	};

	socket.onmessage = function(event) {
		user_data = JSON.parse(event.data);
		console.log(user_data);
		user_data.BasicData = user_data;
		socket.close();
		renderVue();
	}

	socket.onopen = function () {
		request = {
			r : GET_BASIC_DATA,
			g : "",
			c : username
		}
		socket.send(JSON.stringify(request));
	}
}

updateUser = () => {
	$("title").textContent = SITE_NAME;
	var socket = new WebSocket('ws://'+IP+':'+PORT);

	if (!window.WebSocket) {
		alert("Your browser does not support web sockets");
	}

	socket.onerror = function(error) {
		//alert("Connection error either the server or you are offline");
	};

	socket.onmessage = async function(event) {
		user_data = JSON.parse(event.data);
		socket.close();
	}

	socket.onopen = async function () {
		request = {
			r : "B",
			g : username,
			c : username
		}

		socket.send(JSON.stringify(request));
	}
}

async function renderVue (){
	if (user_data.BasicData.RoomNames == null) {
		user_data.BasicData.RoomNames = new Array();
	}
	if (user_data.BackGroundImg != null ) {
		console.log("url ('"+user_data.BackGroundImg+"')")
		$("content").style.backgroundImage ="url('"+ user_data.BackGroundImg.replace(/(\r\n|\n|\r)/gm, "") + "')";
		console.log($("content").style.backgroundImage)
	}
	//$("prof-img").src = "data:image/png;base64,"+user_data.ProfilePic.Data;
	//console.log($("prof-img").src)
	console.log("rend")
	rightnav = new Vue({
		el   : "#rightnav",
		data : {
			name             : user_data.BasicData.Name,
			username         : user_data.BasicData.Username,
			rooms            : user_data.BasicData.RoomNames,
			roomsAreNotEmpty : user_data.BasicData.RoomNames.length != 0,
		}
	});

	topnav = new Vue({
		el   : "#topnav",
		data : {
			name          : SITE_NAME,
			options       : ["Home",/*"Discover","Events",*/"Share","Me"],
			user_controls : ["Settings"/*,"Root"*/,"Activity"],
		}
	});

	for (var i = 0; i < document.getElementsByTagName('button').length; i++) {
		document.getElementsByTagName('button')[i].id = document.getElementsByTagName('button')[i].textContent
	}
	loadFeed();
	hidePerm("loader")
	HomeContent = $("content").innerHTML
	sessionStorage.setItem("innerHTML",$("rightnav").innerHTML);
}

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

Search = str => {
	var socket = new WebSocket('ws://'+IP+':'+PORT);
	console.log("start")

	if (!window.WebSocket) {
		alert("Your browser does not support web sockets");
	}

	socket.onerror = function(error) {
		//alert("Connection error either the server or you are offline");
	};

	socket.onopen = async function () {
		request = {
			r : "S",
			g : username,
			c : str
		}

		socket.send(JSON.stringify(request));

	}

	socket.onmessage = async function(event) {
		ans = JSON.parse(event.data);
		socket.close();
		if (str == "") {
			$("rightnav").innerHTML = sessionStorage.getItem("innerHTML");
			console.log($("rightnav").innerHTML)
		} else if (ans == null) {
			var sb = $("search-bar")
			$("rightnav").innerHTML = '';

			$("rightnav").appendChild(sb)
			var btn = gen("button")
			btn.innerHTML = '<b>'+'No one matches your qurey'+' </b><br>'+'go find someone else';
			btn.onclick = function () {
				renderProfile(this.textContent.split(" ")[0])
			}
			$("rightnav").appendChild(btn);
		} else {
			var sb = $("search-bar")
			$("rightnav").innerHTML = '';

			$("rightnav").appendChild(sb)
			for (var i = 0; i < ans.length; i++) {
				var btn = gen("button")
				btn.innerHTML = '<b>'+ans[i].username+' </b><br>'+ans[i].name;
				btn.onclick = function () {
					getProfileDataFor(this.textContent.split(" ")[0])
				}
				$("rightnav").appendChild(btn);
			}

		}
		$("search-bar").focus();
	}

}

renderComponent = comp => {
	console.log(comp)
	if (comp.trim() == "Settings") {
		renderSettings();
	} else {
		empty($("content"));
		document.body.scrollTop = 0;
		document.documentElement.scrollTop = 0;
		switch (comp.trim()) {
			case "Me":
			getProfileDataFor(user_data.Username);
			break;
			case "Share":
			renderSharePane();
			break;
			case "Activity":
			getActivityDataForRenderingActivityPane();
			break;
			case "Home":
			renderVue();
		}
	}
}


sendBye = () => {
	var socket = new WebSocket('ws://'+IP+':'+PORT);

	if (!window.WebSocket) {
		alert("Your browser does not support web sockets");
	}

	socket.onerror = function(error) {
		alert("Connection error either the server or you are offline");
	};

	socket.onopen = async function () {
		request = {
			r : "b",
			g : username,
			c : ''
		}

		socket.send(JSON.stringify(request));
		socket.close();
	}
}

window.onclick = async function(event) {
	if (event.target == $('modal')) {
  		vanishModal()
	}
}

show = async(user,... elems) => {
	var showable = user;
	for (var i=0;i<elems.length;i++) {
		showable = showable[elems[i]]
	}

	var innerDiv = gen("div");
	innerDiv.id = "inner-modal-space-div";
	innerDiv.className = "inner-modal-space-div";

	console.log(showable)
	if (showable == null || Object.keys(showable).length == 0 || showable.length == 0 ) {
		var data = gen("p");
		data.innerHTML = "<h1 style='padding-top:1.3vw';><b>Nothing was found matching this field</b></h1><br><p style='text-align:center;padding-top:0.3vw;'>Well then I leave the job to fill this up to you</p>";
		innerDiv.appendChild(data);
	} else {
		for (var i=0;i<Object.keys(showable).length;i++) {
			var data = gen("p");
			data.innerHTML = "<b>"+Object.keys(showable)[i]+"</b>";
			innerDiv.appendChild(data);
		}
	}


	$("modal-content").appendChild(innerDiv);
	$("modal-heading").textContent = elems[elems.length - 1]
	$("modal").style.zIndex = "10";
	$("modal").style.opacity = "1";
	await sleep(500);
}
