var colorPallete = {}

async function openRoomCreationDialog() {
    var SocRelData;
    var socket = new WebSocket('ws://'+IP+':'+PORT);
    var members = new Array();

	if (!window.WebSocket) {
		alert("Your browser does not support web sockets");
	}

	socket.onerror = function(error) {
		//alert("Connection error either the server or you are offline");
	};

	socket.onmessage = async function(event) {
		SocRelData = JSON.parse(event.data);
		socket.close();
        renderRoomModalDialog()
	}

	socket.onopen = async function () {
		var request = {
			r : "S+",
			g : username,
			c : username
		}

		socket.send(JSON.stringify(request));
        alert("sent")
	}

    async function renderRoomModalDialog() {
        var innerDiv = gen("div");
        innerDiv.id = "inner-modal-space-div";
        innerDiv.className = "inner-modal-space-div";
        console.log(SocRelData.Friends)
        for (friend of Object.keys(SocRelData.Friends)) {
            var data = gen("button");
            data.style.borderLeftColor = "#ffffff";
            data.innerHTML = "<b>"+SocRelData.Friends[friend].Username+"</b>";
            data.onclick = function () {
                console.log(this.style.borderLeftColor)
                if (this.style.borderLeftColor == "rgb(0, 255, 85)") {
                    this.style.borderLeftColor = "#ffffff";
                    this.style.backgroundColor = this.style.borderLeftColor;
                    for (i in members) {
                        if (members[i] == this.textContent.trim()) {
                            members.splice(i)
                        }
                    }
                } else {
                    this.style.borderLeftColor = "#00ff55";
                    this.style.backgroundColor = this.style.borderLeftColor;
                    members.push(this.textContent.trim())
                }
            }
            data.onmouseover = async function () {
                this.style.backgroundColor = this.style.borderLeftColor;
                this.style.color = "#000";
                this.style.fontSize = "2vw";
                await sleep(250);
            }
            data.onmouseout = async function () {
                this.style.backgroundColor = "#222";
                this.style.fontSize = "1vw";
                this.style.color = "#ffffff";
                await sleep(250);
            }
            innerDiv.appendChild(data);
        }

        if (Object.keys(SocRelData.Friends).length == 0){
            var data = gen("p");
            data.style.textAlign = "center";
            data.style.backgroundColor = "rgba(0,0,0,0)";
            data.style.fontSize = "3vw";
            data.innerHTML = "<b>No Friends For Room Creation</b>";
            innerDiv.appendChild(data);
        }

        var submitButton = gen("button");
        submitButton.id = "submit-button";
        submitButton.textContent = "Create Room";
        submitButton.onclick = function () {
            console.log(members)
            if ($("room-name-input").value == "") {
                alert("there is no room name")
            } else if (members.length == 0) {
                alert("No one was chosen")
            } else if (user_data.RoomNames.indexOf($("room-name-input").value) != -1) {
                alert("The room with that name alreadyt exists")
            } else {
                sendRoomCreationDataAndCreateRoom($("room-name-input").value,members)
            }
        }

        var nameInp = gen("input");
        nameInp.id = "room-name-input";
        nameInp.placeholder = "The Name Of The Room"

        $("modal-content").appendChild(nameInp);
        $("modal-content").appendChild(innerDiv);
        $("modal-content").appendChild(submitButton);
        $("modal-heading").textContent = "Make A Room"
        $("modal").style.zIndex = "10";
        $("modal").style.opacity = "1";
        await sleep(500);
    }
}

sendRoomCreationDataAndCreateRoom = (name,members) => {
    var socket = new WebSocket('ws://'+IP+':'+PORT);

    members.push(username)

    var init = {
        r : "R+",
        g : username,
        c : "",
    }
    var req = {
        n : name,
        p : members,
        a : username,
    }

	if (!window.WebSocket) {
		alert("Your browser does not support web sockets");
	}

	socket.onerror = function(error) {
		//alert("Connection error either the server or you are offline");
	};

	socket.onmessage = function(event) {
        rightnav._data.rooms.push(event.data)
        rightnav._data.roomsAreNotEmpty = true;
        $("close").click()
	}

	socket.onopen = function () {
        socket.send(JSON.stringify(init));
		socket.send(JSON.stringify(req));
    }
}

renderRoom = r_name => {
    var presentRoom;
    r_name = r_name.trim();

    var socket = new WebSocket('ws://'+IP+':'+PORT);
    var init = {
        r : "R#",
        g : username,
        c : r_name,
    }

	if (!window.WebSocket) {
		alert("Your browser does not support web sockets");
	}

	socket.onerror = function(error) {
		//alert("Connection error either the server or you are offline");
	};

	socket.onmessage = function(event) {
        console.log(event.data)
        presentRoom = JSON.parse(event.data);
        console.log(presentRoom)
        renderBase(presentRoom);
	}

	socket.onopen = function () {
        socket.send(JSON.stringify(init));
    }
}

function renderBase(room) {
    empty($("content"));
    msgHolder = gen("div")
    msgHolder.id = "msg-holder";
    msgHolder.onscroll = function(ev) {
        if (this.scrollTop == 0) {
                console.log()
                conn.send("+")
        }
    };
    msgInput = gen("input")
    msgInput.id = "msg-input";
    msgInput.onbeforeunload =function () {
        conn.close()
        return "close";
    }

    msgInput.onfocus = function () {
        $("content").scrollTo(0,$("msg-holder").scrollHeight);
    }

    msgInput.onkeypress = function (e) {
    		if (e.keyCode == 13) {
                if (this.value.length != 0) {
                    conn.send("<b>"+username+"</b><br>"+this.value)
                    this.value = "";
                }
        	}
	}

    /*roomEditor = gen("div");
    roomEditor.id = "room-options";
    roomEditor.innerHTML = "<span class=\"fa fa-bars\" style='margin:0vw;font-size:2.4vw;color:#ffffff;'></span>"
    roomEditor.onclick = async function () {
        var presentRoom;
        r_name = r_name.trim();

        var socket = new WebSocket('ws://'+IP+':'+PORT);
        var init = {
            r : "R#",
            g : username,
            c : r_name,
        }

    	if (!window.WebSocket) {
    		alert("Your browser does not support web sockets");
    	}

    	socket.onerror = function(error) {
    		//alert("Connection error either the server or you are offline");
    	};

    	socket.onmessage = function(event) {
            presentRoom = JSON.parse(event.daya)
            imsd = gen("div")
            imsd.id = ('inner-modal-space-div')
            imsd.appendChild()

            $("modal-heading").textContent = "Edit Room"
            $("modal").style.zIndex = "10";
            $("modal").style.opacity = "1";
            await sleep(500);
    	}

    	socket.onopen = function () {
            socket.send(JSON.stringify(init));
        }

    }*/

    //$("content").appendChild(roomEditor);
    $("content").appendChild(msgHolder);
    $("content").appendChild(msgInput);
    openConnectionAndStartListening(room)
}

var stopRequests = false;
var conn;

openConnectionAndStartListening = room => {
    var presentRoom;

    conn = new WebSocket('ws://'+IP+':'+PORT+'/chat');

	if (!window.WebSocket) {
		alert("Your browser does not support web sockets");
	}

	conn.onerror = function(error) {
		//alert("Connection error either the server or you are offline");
	};

	conn.onmessage = function(event) {
        console.log(event.data)
        try {
            val = JSON.parse(event.data)
            for (v of val.reverse()) {
                prependMessage(v)
            }
            console.log(val)
        } catch (e) {
            console.log("rend")
            if (event.data != "B") {
                console.log("in rend")
                appendMessage(event.data)
            } else {
                stopRequests = true;
            }
        }
	}

	conn.onopen = function () {
        conn.send(room.Id.toString());
        conn.send("+");
        conn.send("+");
        conn.send("+");
        conn.send("+");
    }
}

appendMessage = message => {
    this_user = message.split("</b>")[0].trim().substring(3).trim();
    if (colorPallete[this_user] == undefined) {
        colorPallete[this_user] = getRandomColor()
    }

    msgDiv = gen("msg");
    msgDiv.className = "msg";
    msgDiv.innerHTML = message;
    msgDiv.style.borderBottomColor = colorPallete[this_user]

    msgDiv.onmouseover = async function () {
        this.style.backgroundColor = this.style.borderBottomColor;
        this.style.color = "#000";
        this.style.fontSize = "1.5vw";
        await sleep(250);
    }

    msgDiv.onmouseout = async function () {
        this.style.backgroundColor = "#000";
        this.style.fontSize = "1vw";
        this.style.color = "#fff";
        await sleep(250);
    }

    console.log(this_user.trim() == username)

    if (this_user.trim() == username) {
        msgDiv.style.marginLeft = "40%";
    } else {
        msgDiv.style.marginRight = "40%";
    }

    $("msg-input").focus()
    $("msg-holder").appendChild(msgDiv)
    $("msg-holder").scrollTo(0,$("msg-holder").scrollHeight);
}

prependMessage = message => {
    this_user = message.split("</b>")[0].trim().substring(3).trim();
    if (colorPallete[this_user] == undefined) {
        colorPallete[this_user] = getRandomColor()
    }

    msgDiv = gen("msg");
    msgDiv.className = "msg";
    msgDiv.innerHTML = message;
    msgDiv.style.borderBottomColor = colorPallete[this_user]

    msgDiv.onmouseover = async function () {
        this.style.backgroundColor = this.style.borderBottomColor;
        this.style.color = "#000";
        this.style.fontSize = "1.5vw";
        await sleep(250);
    }

    msgDiv.onmouseout = async function () {
        this.style.backgroundColor = "#000";
        this.style.fontSize = "1vw";
        this.style.color = "#fff";
        await sleep(250);
    }


    console.log(this_user.trim() == username)

    if (this_user.trim() == username) {
        msgDiv.style.marginLeft = "40%";
    } else {
        msgDiv.style.marginRight = "40%";
    }

    $("msg-input").focus()
    $("msg-holder").prepend(msgDiv)
    $("msg-holder").scrollTo(0,$("msg-holder").scrollHeight);
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
