getActivityDataForRenderingActivityPane = () => {
	var req = {
		r : "s",
		g : "",
		c : username,
	}

	var socket = new WebSocket('ws://'+IP+':'+PORT);

	if (!window.WebSocket) {
		alert("Your browser does not support web sockets");
	}

	socket.onerror = function(error) {
		//alert("Connection error either the server or you are offline");
	};

	socket.onopen = async function () {
		socket.send(JSON.stringify(req));
    }

    socket.onmessage = async function (event) {
        socket.close();
        SupportingData = JSON.parse(event.data)
        renderActivities(SupportingData)
    }
}

renderActivities = SupportingData => {
    var heading = gen("h1");
    heading.id = 'activity-tab-heading';
    heading.textContent = "My Activity";

    var div = gen("id");
    div.id = "activity-tab-back-div";

    for (activity of SupportingData.Activity.reverse()) {
        var para = gen("p");
        para.innerHTML = activity;
        div.appendChild(para);
    }

    $("content").appendChild(heading);
    $("content").appendChild(div);
}
