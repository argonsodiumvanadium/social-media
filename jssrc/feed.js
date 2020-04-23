var feed_LikedBy = new Array();
var feedObj;
var feed = null;
var stop = false;

loadFeed = () => {
	startFeed()

	if ($("undernav") != null) {
		$("undernav").style.display = "none";
	}

	$("content").onscroll = function() {
	  var offset = this.scrollTop;
	  var height = this.scrollHeight;

	  if ((offset+4500) >= height) {
		  console.log(stop)
		  if (!stop) {
			 console.log("call")
			  reloadFeed()
		  }
	  }
	}

	heading = gen("p")
	heading.id = 'activity-tab-heading';
	heading.textContent = "Your Feed";

	$("content").appendChild(heading);
}

startFeed = () => {
	var req = {
		r : "F*",
		g : username,
		c : "",
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
		socket.send("+");
	}

	socket.onmessage = async function (event) {
        console.log(event.data)

		if (event.data == "B") {
            renderFeed(new Array())
        } else if (event.data.length == 0) {
			stop = true
		} else {
            feed = JSON.parse(event.data)
			console.log(feed.length)
            renderFeed(feed);
        }
	}
}

reloadFeed = () => {
	var req = {
		r : "f*",
		g : username,
		c : "",
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
		socket.send("+");
	}

	socket.onmessage = async function (event) {
		try {
			if (event.data == "B") {
	            renderFeed(new Array())
				stop = true;
	        } else {
	            feed = JSON.parse(event.data)
	            renderFeed(feed);
	        }
		} catch (e) {
			stop = true;
		}
	}
}

renderFeed = newfeed => {
	if (feed == null) {
		feed = newfeed.reverse();
	} else {
		feed = [ ...feed , ...newfeed.reverse()]
	}

    if (newfeed.length == 0) {
        heading = gen("p")
        heading.id = 'activity-tab-heading';
        heading.innerHTML = "<span style='color:#ff3033;font-family: \"Spartan\", sans-serif;font-size: 3.5vw;'>Well thats Your feed For the day</span>"
        $("content").appendChild(heading);
    } else {
        for (post of newfeed) {
            i = feed.indexOf(post)
			feed_LikedBy[i] = post.LikedBy
            var container = gen("div");
            container.className = "post-container";

			console.log(post.Type)
            switch (post.Type) {
                case IMG:
                    var img = gen("img");
                    img.src = post.Data;
                    img.id = ""+i
                    img.alt = "some post which could not be rendered";

                    var para = gen("p");
					para.style.textAlign = "center";
                    para.innerHTML = "<p><b>"+post.Owner+"</b><br>"+post.Caption+"</p>";

                    container.appendChild(img);
                    container.appendChild(para);
                    $("content").appendChild(container);
                    break;
                case BLOG:
					if ($("undernav") != null) {
						$("undernav").style.display = "none";
						$("undernav").onchange = function () {
							$("undernav").style.display = "inline-block";
						}
					}
                    var para = gen("p");
                    para.innerHTML = "<p><b>"+post.Owner+"</b><br></p>";

                    var blogData = gen("div");
                    blogData.id = "blog-data";
                    blogData.innerHTML = post.Data;

                    container.appendChild(para);
                    container.appendChild(blogData);
                    $("content").appendChild(container);
                    break;
            }
            var like_btn;
            if (post.LikedBy[username] == undefined || !post.LikedBy[username]) {
    			like_btn = {
    				value : '<span id="like-span'+i+'" style="margin-top:0vw;color:'+WHITE+';">&#9829;</span>',
    				backCol : LIKE_BTN_COL,
    				owner : post.owner,
    				index : i,
    				id : "like-btn"+i.toString(),
    				onclick : function () {
    					reverseExtreme($("like-span"+this.index),this)
    					updateFeedLike(this.index,true);
    				}
    			}
    		} else {
    			like_btn = {
    				value : '<span id="like-span'+i+'" style="margin-top:0vw;color:'+LIKE_BTN_COL+';">&#9829;</span>',
    				backCol : WHITE,
    				owner : post.owner,
    				index : i,
    				id : "like-btn"+i.toString(),
    				onclick : function () {
    					reverseExtreme($("like-span"+this.index),this)
    					updateFeedLike(this.index,feed_LikedBy[this.index][username]);
    				}
    			}
    		}

            var comment_btn = {
                value : "<span class='fa fa-comment' id = 'message-span' style='margin:0vw;font-size:2vw;'></span>",
                backCol : BLUE,
                index : i,
                id : "comment-btn",
                frontCol : WHITE,
                onclick : function () {
                    openFeedComments(this.index);
                },
            }

            renderAndAddButtons([like_btn,comment_btn],container)
        }
        handleFeedLikeBtnHoverEvents(post.owner);
    }
}

function handleFeedLikeBtnHoverEvents () {
    for(var i=0;i<feed.length;i++) {
        var para = gen("p");
        para.id = "like-num"+i;
        para.style.position = "relative";
        para.style.left = "0%";
        para.style.top = "0%";
        para.style.color = "black";
        para.style.zIndex = "10";
        para.style.margin = "0%";
        para.style.display = "none";
        para.style.fontSize = '0.8vw';
        para.textContent = feed[i].Likes.toString();

        $("like-btn"+i).appendChild(para)

        $("like-btn"+i).onmouseover = function () {
            console.log(feed[this.index].Likes);
            $("like-num"+this.index).textContent = feed[this.index].Likes.toString();
            $("like-span"+this.index).style.display = 'none';
            $("like-num"+this.index).style.display = 'block';
        }

        $("like-btn"+i).onmouseout = function () {
            $("like-span"+this.index).style.display = 'block';
            $("like-num"+this.index).style.display = 'none';
        }
    }
}

reverseExtreme = (a,b) => {
	var c = b.style.backgroundColor;
	b.style.color = c;
	b.style.backgroundColor = a.style.color;
	a.style.color = c;
}

openFeedComments = async (index) => {
	var i = index
	$("modal-heading").textContent = "Comments";
	var innerDiv = gen("div")
	innerDiv.id = "inner-modal-space-div";
	innerDiv.className = "inner-modal-space-div"

	console.log(feed[index].Comments)
	if (feed[index].Comments == null) {
		var data = gen("p");
		data.id = 'rm-able-header'
		data.innerHTML = "<h1 style='padding-top:1.3vw;' ><b>No one has commented on this post</b></h1><br><p style='text-align:center;padding-top:0.3vw;'>Be the first to comment !</p>";
		innerDiv.appendChild(data);
	} else {
		for (var i=0;i<feed[index].Comments.length;i++) {
			var data = gen("p");
			data.innerHTML = feed[index].Comments[i];
			innerDiv.appendChild(data);
		}
	}


	var btn = gen("div");
	btn.id = 'inner-modal-space-div-button'
	btn.style.backgroundColor = "#00ff44";
	btn.textContent = "Comment";
	btn.index = index;
	btn.owner = feed[index].Owner;
	btn.onclick = function() {
		sendFeedCommentDataToServer(this.owner,$('inner-modal-space-div-input').value,this.index,true)
		$('inner-modal-space-div-input').value = "";
		$('inner-modal-space-div-input').focus();
	}

	var input = gen("input");
	input.type = 'text';
	input.id = "inner-modal-space-div-input";
	input.placeholder = "Comment over here ... ";
	input.onkeypress = function (e) {
		if (e.keyCode == 13) {
	        $("inner-modal-space-div-button").click();
    	}
	}

	$("modal-content").appendChild(innerDiv)
	$("modal-content").appendChild(input)
	$("modal-content").appendChild(btn)
	$("modal").style.zIndex = "10";
	$("modal").style.opacity = "1";
	await sleep(500);
	$('inner-modal-space-div-input').focus();
}

sendFeedCommentDataToServer = (owner,val,index,update) => {
	var initializer = {
		r : "U+",
		g : username,
		c : owner,
	}

	var likeReq = {
		c : val,
		pi : feed[index].Index,
		d : false,
	}

	console.log(feed[index].index)

	if (!update) {
		initializer.r = "U-"
	}

	var socket = new WebSocket('ws://'+IP+':'+PORT);

	if (!window.WebSocket) {
		alert("Your browser does not support web sockets");
	}

	socket.onerror = function(error) {
		//alert("Connection error either the server or you are offline");
	};

	socket.onopen = async function () {
		socket.send(JSON.stringify(initializer));
		socket.send(JSON.stringify(likeReq));
		socket.close();

		text = "<p><b>" + owner + "</b><br>" + val +"</p>"
		if (feed[index].Comments == null) {
			feed[index].Comments = new Array();
		}
		if ($("rm-able-header") != null) {
			$("rm-able-header").remove()
		}
		feed[index].Comments.push(text);
		empty_div = gen("div");
		empty_div.innerHTML =text;
		$('inner-modal-space-div').appendChild(empty_div);
		$('inner-modal-space-div').scrollTop = $('inner-modal-space-div').scrollHeight;
	};
}

updateFeedLike = (index,liked) => {
	var initializer = {
		r : "U+",
		g : username,
		c : feed[index].Owner,
	}

	var likeReq = {
		c : "",
		pi : feed[index].Index,
		d : true,
	}

	console.log(index+"      "+feed[index].Index)

	if (!liked) {
		feed[index].Likes += 1
		feed[index].LikedBy[username] = true;
		console.log("adding a like")
		console.log(index)
		console.log(feed[index].Likes)
		feed_LikedBy[index][username] = true;
	} else {
		feed[index].Likes -= 1;
		initializer.r = "U-";
		feed[index].LikedBy[username] = false;
		console.log(index)
		console.log(feed[index].Likes)
		feed_LikedBy[index][username] = false;
		console.log("rm a like")
	}

	var socket = new WebSocket('ws://'+IP+':'+PORT);

	if (!window.WebSocket) {
		alert("Your browser does not support web sockets");
	}

	socket.onerror = function(error) {
		//alert("Connection error either the server or you are offline");
	};

	socket.onopen = async function () {
		socket.send(JSON.stringify(initializer));
		socket.send(JSON.stringify(likeReq));
		socket.close();
	}
}
