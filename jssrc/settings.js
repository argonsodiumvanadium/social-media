var socket

renderSettings = args => {
    socket = new WebSocket('ws://'+IP+':'+PORT+"/settings");
	console.log("start")

	if (!window.WebSocket) {
		alert("Your browser does not support web sockets");
	}

	socket.onerror = function(error) {
		//alert("Connection error either the server or you are offline");
	};

	socket.onopen = async function () {
		socket.send(username);
	}

	socket.onmessage = async function(event) {
        user = JSON.parse(event.data)
        renderModalViewForSettings(user)
    }
}

renderModalViewForSettings = async user => {
    var str = '\
    <p>Profile Pic Goes Here</p>\
    <input type="file" id="ProfilePic" style="margin-left:1.5vw;" >\
    <p>The Background Image Go Here</p>\
    <input type="file" id="BackGroundImg" style="margin-left:1.5vw;margin-bottom:2vw;"><br>\
    '
    for (field of Object.keys(user)) {
        if (field != "Username"&&field != "Password"&&field !="BackGroundImg"&&field !="ProfilePic"&&field !="RoomNames"&&field !="DisplayName") {
            str += '\
            <p style="display:inline-block;margin:0.7vw 1.5vw 0.7vw 1.5vw;">'+field+'</p>\
            <input type="text" id="'+field+'" class="setting-input-dialog" value= "'+user[field]+'"><br>\
            ';
        } else {
            console.log("here")
        }
    }

    str += "<br><br><br>"

    $("modal-content").innerHTML += str;
    var btn = gen("button");
    btn.style.backgroundColor = '#ff6600';
    btn.onclick = async function() {
        console.log("click")
        for (field of Object.keys(user)) {
            if (field != "Username"&&field != "Password"&&field !="BackGroundImg"&&field !="ProfilePic"&&field !="RoomNames"&&field !="DisplayName") {
                user[field] = $(field).value
            } else if (field =="BackGroundImg"||field =="ProfilePic") {
                var file = $(field).files[0];
                if (file != null) {
                    console.log('changing')
                    var reader = new FileReader();
                    reader.sum_field = field
                    var done= false;

                    reader.onloadend = async function() {
                        var pureImgData = this.result;
                        console.log(this.sum_field)

                        if (this.sum_field == "ProfilePic") {
                            user[this.sum_field].Data = pureImgData.split(",")[1].trim();
                        } else {
                            user[this.sum_field] = pureImgData;
                            console.log(this.sum_field)
                            console.log(user[this.sum_field])
                        }

                        console.log(user[this.sum_field].Data)
                        done = true
                    }

                    reader.readAsDataURL(file);
                    while (!done) {
                        await sleep(100)
                    }
            	}
            }
        }
        console.log("send")
        console.log(user)
        socket.send(JSON.stringify(user))
    }
    btn.textContent = "Change"

    $("modal-content").appendChild(btn)
    $("modal-heading").textContent = "Edit User : "+username;
    $("modal").style.zIndex = "10";
    $("modal").style.opacity = "1";
    await sleep(500);
}
