const BLOG = "b",VID = "v",IMG ="i",INTR = "I"

renderSharePane = () => {
	$("content").innerHTML = '\
		<label class="file">\
			<input type="file" id="file_btn" label="File browser example" onchange="getFile(this);">\
			<span class="file-custom"></span>\
		</label>\
		<textarea id = "data-disp" onchange="textAreaAdjust(this);" onbeforeunload = "check(this);" onload="load(this)" placeholder="The text for the blog goes here \
		\nby the way markdown is not supported but html is,\n\
so you can use span and what not to beautify the text you write\nalso you need to explicitly use <br> to break lines as enter won\'t work (visually yes but not during the display)\n another \
good tip would be the fact that you should start your blog with <h1> ... </h1> tag so it is displayed in bold as your heading"></textarea>\
		<button class = "data-submit" onclick="submitBlog();"><p>POST !</p></button>\
	';
}

function textAreaAdjust(arg) {
	var l1 = document.body.scrollTop;
	var l2 = document.documentElement.scrollTop;
	arg.style.height = "1px";
	arg.style.height = (arg.scrollHeight)+"px";
	document.body.scrollTop = l1;
	document.documentElement.scrollTop = l2;
}

load = arg => {
	var data = sessionStorage.getItem("Blog")
	if ( data != undefined) {
		arg.value = data
	}
}

check = arg => {
	if (arg.value != "") {
		sessionStorage.setItem("Blog","If you leave then all that you have written will vanish")
	}
}

submitBlog = () => {
	var store = $("data-disp").value;
	console.log(store);
	proccessAndPost(store,BLOG,"");
}

getFile = inpComp => {
	var file = inpComp.files[0];
	var reader = new FileReader();
	console.log(file);

	reader.onloadend = function() {
		var pureImgData = reader.result;
		renderPreview(pureImgData);
	}

	reader.readAsDataURL(file);
}

async function renderPreview (args){
	image = gen("img");
	image.id = "modal-image"
	image.src = args;
	image.alt = "Something you tried to upload";

	$("modal-heading").innerHTML = "<b>POST</b>";

	var caption = gen("textarea");
	caption.id = "modal-caption"
	caption.onkeyup = function() {
		textAreaAdjust(this);
	}
	caption.placeholder = "The Caption Goes Here"

	var btn = gen("button");
	btn.onclick = function() {
		proccessAndPost($("modal-image").src,IMG,$("modal-caption").value);
	}
	btn.textContent = "POST !"

	$("modal-content").appendChild(image);
	$("modal-content").appendChild(caption);
	$("modal-content").appendChild(btn);

	$("modal").style.zIndex = "10";
	$("modal").style.opacity = "1";
	await sleep(500);
}

async function vanishModal () {
	$("modal").style.opacity = "0";
	await sleep(500);
	var t = $("close");
	var t1 = $("modal-heading");
	$("modal-content").innerHTML = "";
	$("modal-content").appendChild(t);
	$("modal-content").appendChild(t1);
	$("modal").style.zIndex = "-1";
}

proccessAndPost = (src,type,info) => {
	console.log(type);
	var data = {
		Type   : type,
		Data : src,
		Caption  : info,
	}
	var initializer = {
		r : "p+",
		g : username,
		c : "",
	}

	var socket = new WebSocket('ws://localhost:'+PORT);

	if (!window.WebSocket) {
		alert("Your browser does not support web sockets");
	}

	socket.onerror = function(error) {
		//alert("Connection error either the server or you are offline");
	};

	socket.onopen = async function () {
		socket.send(JSON.stringify(initializer));
		socket.send(JSON.stringify(data));
		socket.close();
		updateUser();
		alert("The Posting is done");
		$("close").click()
		$("data-disp").value = "";
		$("data-disp").style.height = "8vw";
	}
}
