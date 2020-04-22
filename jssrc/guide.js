const SITE_NAME = "NAME"

$ = args => {
	return document.getElementById(args)
}


function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}


render = args => {
	$("title").textContent = SITE_NAME;
	var heading = new Vue ({
		el   : "#heading",
		data : {
			name    : SITE_NAME,
			content : "A social media that will change as you do"
		}
	});

	switch (args) {
	case "signup":
		var databox = new Vue ({
			el      : "#form",
				data    : {
					printables : [
						"Sign Up",
						"Log In"
					],
				}
			}
		);


	}
}

setEmptyWarn = args => {
	if (args.value == "" || args.value == null) {
		args.style.borderBottomColor = "#ff0000";
	} else {
		args.style.borderBottomColor = "white";
	}
	return !(args.value == "" || args.value == null)
}

register = btn => {
	var inpBox = document.getElementsByTagName('input');
	var pass = true;

	for (var i = 0; i < inpBox.length; i++) {
		pass = pass && (setEmptyWarn(inpBox[i]));
	}

	username = $("u").value
	password = $("p").value

	if (pass) {
		if (btn.id == "su") {
			name = $("n").value
			if ($("p").value.length >= 8 && !$("u").textContent.includes(" ")) {
				if ($('p').value == $('r').value) {
					var query = {
						name     : name,
						username : username,
						password : password
					}
					validate(JSON.stringify(query));
				} else {
					alert('the passwords do not match')
				}
			} else {
				$("u").textContent = $("u").textContent.trim()
				if ($("u").textContent.includes(" ")) {
					alert('the string contains spaces')
				} else {
					alert('the password is too short')
				}
			}
		} else {
			if ($("p").value.length >= 8 && !$("u").textContent.includes(" ")) {
				var query = {
					username : username,
					password : password
				}

				validate(JSON.stringify(query));
			} else {
				alert('either the username or password are incorrect');
			}
		}
	}
}

validate = async data => {
	socket = new WebSocket('ws://127.0.0.1:9000/register');

	socket.onopen = async function() {
		socket.send(data)
	}

	socket.onerror = function () {
		alert("network error")
	}

	socket.onmessage = async function (event) {
		console.log(event.data)
		switch (event.data) {
			case "E":
				alert("incorrect or used credentials")
				break;
			case "!":
				alert("Someone is logged into your account RIGHT NOW");
			default:
			try {
				localStorage.setItem("user",event.data);
				load("main.htm")
			} catch (e) {
				console.log(e)
				alert("I do not have access to the localstorage of the browser, thus I am unable to store some essential data\
				\nSolutions:-\n -\tUse A different browser like Firefox\n -\tAllow Usage Of session Storage")
			}
		}
		socket.close();
	}
}

async function changeSlowly (btn) {
	var children = $("form").children;
	var t = 0

	for (var i=0; i<children.length ; i++) {
		children[i].style.opacity = '0';
		console.log(children[i].style.color);
	}

	await sleep(550);


	switch (btn.id) {
		case "li":
			$("body").innerHTML = ''
			$("body").innerHTML =
			'\
			<div class="heading" id="heading">\
			<h1>{{ name }}</h1>\
			<p>{{ content }}</p>\
			</div>\
			\
			<div id="form-holder"></div>\
			<div id="form">\
				<input type="text" placeholder="username" id="u" style="margin-top:6vw;">\
				<input type="password" placeholder="password" id="p">\
				<button id="li" onclick = "register(this);" style="border-bottom-color: white">\
					Log In\
				</button>\
				<button id="su" onclick="changeSlowly(this)" style="margin-top: 1vw;">\
					Sign Up\
				</button>\
			</div>\
			\
			';
			render();

			children = $("form").children;

			for (var i=0;i<children.length;i++) {
				children[i].style.opacity = '0';
			}

			await sleep(550);
			for (var i=0;i<children.length;i++) {
				children[i].style.opacity = '1';
				console.log(children[i].style.opacity)
			}

			console.log("done");
			break;

		default:
			$("body").innerHTML =
			'\
			<div class="heading" id="heading">\
			<h1>{{ name }}</h1>\
			<p>{{ content }}</p>\
			</div>\
			\
			<div id="form-holder"></div>\
			<div id="form">\
				<input type="text" placeholder="name" id="n">\
				<input type="text" placeholder="username" id="u">\
				<input type="password" placeholder="password" id="p">\
				<input type="password" placeholder="confirm password" id="r">\
				<button id="su" onclick = "register(this);" style="border-bottom-color: white">\
					Sign Up\
				</button>\
				<button id="li" onclick="changeSlowly(this)" style="margin-top: 1vw;">\
					Log In\
				</button>\
			</div>\
			\
			';
			render();

			children = $("form").children;

			for (var i=0;i<children.length;i++) {
				children[i].style.opacity = '0';
			}

			await sleep(550);
			for (var i=0;i<children.length;i++) {
				children[i].style.opacity = '1';
				console.log(children[i].style.opacity)
			}
	}
}

async function load(args) {
	var children = $("body").children;

	for (var i = 0; i < children.length; i++) {
		children[i].style.opacity = "0";
	}

	await sleep(550);

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
