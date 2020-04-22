//the posts constants are in share.js

const UPDATE_POST_POS = "U+"
const UPDATE_POST_NEG = "U-"

var likes = {}
var LikedBy = []

getProfileDataFor = name => {
	document.body.scrollTop = 0;
	document.documentElement.scrollTop = 0;
	var socket = new WebSocket('ws://'+IP+':'+PORT);

	if (!window.WebSocket) {
		alert("Your browser does not support web sockets");
	}

	socket.onerror = function(error) {
		//alert("Connection error either the server or you are offline");
	};

	socket.onopen = async function () {
		request = {
			r : GET_PROF_DATA,
			g : username,
			c : name,
		}

		socket.send(JSON.stringify(request));
	}

	socket.onmessage = async function(event) {
		var data = JSON.parse(event.data)
		console.log(event.data)
		if (data.SocialRelations.Username == undefined) {
			console.log("hohohjo")
			data.SocialRelations.Username = {};
		}
		if (data.Friends == undefined) {
			data.Friends = {};
			console.log(data.Friends)
		}
		if (data.Followers == undefined) {
			console.log("hohohjo")
			data.Followers = {};
		}
		socket.close();
		renderProfile(data)
	}
}

renderProfile = data => {
	$("content").innerHTML = '';
	console.log($('content').innerHTML)
	biodata = ["<b id='see-all-friends' onclick='show(this.user,\"SocialRelations\",\"Friends\");' onmouseover='this.style.cursor =\"pointer\";' >Friends</b> : "+Object.keys(data.SocialRelations.Friends).length,
	"<b id='see-all-followers' onclick='show(this.user,\"SocialRelations\",\"Followers\");' onmouseover='this.style.cursor =\"pointer\";'>Followers</b> : "+Object.keys(data.SocialRelations.Followers).length,
	"<b id='see-all-following' onclick='show(this.user,\"SocialRelations\",\"Following\");' onmouseover='this.style.cursor =\"pointer\";'>Following</b> : "+Object.keys(data.SocialRelations.Following).length,
	"<b>Gender</b> : "+choose(data.BasicData.Gender,"gender"),
	"<b>Joined on</b> : "+data.ProfileData.JoinDate,
	"<b>Last Active</b> : "+data.ProfileData.LastActive,
	"<b>Connection To You</b> : "+getConnection(data),
	"<b>Mutual Friends</b> : "+data.ProfileData.MutualFriends[user_data.Username]]

	var undernav = gen("div");
	undernav.id = "undernav";
	undernav.style.margin = "10% 0px 0px 5%";
	undernav.style.padding = "1vw";
	undernav.style.position = "static";
	undernav.style.height = "50%";
	undernav.style.width = "70%";
	undernav.style.maxHeight = "40%";
	undernav.style.backgroundColor = "#999999";this
	undernav.style.display = "inline-block";

	var divide1 = gen("div");
	divide1.className = "divide";
	divide1.style.marginRight = "15%";

	var prof_img = gen("img");
	prof_img.id = "prof-img";
	if (!(prof_img.src.startsWith("data:image/png;base64,"))){
		prof_img.src = "data:image/png;base64,"+data.BasicData.ProfilePic.Data;
	}  else {
		prof_img.src = data.BasicData.ProfilePic.Data;
	}
	prof_img.alt = "profile picture";
	prof_img.onclick = function () {

	}

	var nameAndAll,bio;
	nameAndAll = gen("p");
	nameAndAll.innerHTML = "<b>"+data.BasicData.Username+"</b><br>"+data.BasicData.Name;
	bio = gen("p");
	bio.textContent = choose(data.BasicData.Bio,"bio");

	var divide2 = gen("div");
	divide2.className = "divide";

	for (var i = 0; i < biodata.length; i++) {
		para = gen("p");
		para.style.textAlign = "left";
		console.log(biodata[i])
		para.innerHTML = biodata[i];
		divide2.appendChild(para)
	}


	divide1.appendChild(prof_img);
	divide1.appendChild(nameAndAll);
	divide1.appendChild(bio);
	undernav.appendChild(divide1);
	undernav.appendChild(divide2);
	$("content").appendChild(undernav);

	$("see-all-friends").user = data;
	$("see-all-followers").user = data;
	$("see-all-following").user = data;

	var buttonRelay = gen("div");
	buttonRelay.id = "btn-relay";
	buttonRelay.style.height = "calc(40% + 2vw)";
	var frndButtonData,fllwrsButtonData,anonymButtonData;
	LoadUserButtons(data,buttonRelay);

	$("content").appendChild(buttonRelay);

	var postGalore = gen("div");
	postGalore.id = "post-galore";

	postGalore.innerHTML = "<h1 style='margin-top:1vw;color:black;'><b>My Album</h1></b>"

	if (data.ProfileData.Posts == null) {
		postGalore.innerHTML += "<p><b>No Posts have Been Posted</b><br>Well There Is Nothing To See Here</p>";
	} else if (Object.keys(data.ProfileData.Posts).length == 0) {
		postGalore.innerHTML += "<h1><b>No Posts have Been Posted</b><br>Well There Is Nothing To See Here</h1>";
	} else if (data.AccountType == "P" && (data.SocialRelations.Followers)[user_data.Username] == undefined  ) {
		postGalore.innerHTML += "<h1><b>The Account Is Private</b><br>Follow to see the posts</h1>";
	} else {
		getAndDumpPosts(data.ProfileData.Posts,postGalore,data);
	}

	$("content").appendChild(postGalore);
	handleLikeBtnHoverEvents(data);

	var moreInfo = gen("div");
	moreInfo.id = "more-info";
	moreInfo.innerHTML = "";
	var appendStr = "";

	if (Object.keys(data.ProfileData.ContactInfo).length != 0) {
		appendStr = "<h1>Contact Details</h1><br>";
		for (var i = 0; i < Object.keys(data.ContactInfo).length; i++) {
			var key = Object.keys(data.ContactInfo)[i];
			appendStr += "<b>"+Object.keys(data.ContactInfo)[i]+"</b> : <br>";
			for (var i = 0; i < data.ContactInfo[key].length; i++) {
				appendStr += data.ContactInfo[key][i]+"<br>";
			}
		}
	} else {
		appendStr = "<h1 style='text-align:center;'>No Information Provided</h1><br>";
	}

	if (data.MoreAbtMe != undefined){
		if (appendStr == "<h1 style='text-align:center;'>No Additional Information</h1><br>") {
			appendStr = "";
		}

		appendStr += "<h1>More about "+data.Username+"</h1><br>";
		for (var i = 0; i < (data.MoreAbtMe).length; i++) {
			appendStr += data.MoreAbtMe[i];
		}
	}

	moreInfo.innerHTML = moreInfo.innerHTML + appendStr;

	$("content").appendChild(moreInfo);
}

getAndDumpPosts = (posts,component,data) => {
	for (var i = posts.length-1 ; i >= 0 ; i--) {
		LikedBy[i] = posts[i].LikedBy;

		var container = gen("div");
		container.className = "post-container";

		switch (posts[i].Type) {
		case IMG:
			var img = gen("img");
			img.src = posts[i].Data;
			img.id = ""+i
			img.alt = "some post which could not be rendered";

			var para = gen("p");
			para.innerHTML = "<p><b>"+data.BasicData.Username+"</b><br>"+posts[i].Caption+"</p>";

			container.appendChild(img);
			container.appendChild(para);
			component.appendChild(container);
			break;
		case BLOG:
			var para = gen("p");
			para.innerHTML = "<p><b>"+data.BasicData.Username+"</b><br></p>";

			var blogData = gen("div");
			blogData.id = "blog-data";
			blogData.innerHTML = posts[i].Data;

			container.appendChild(para);
			container.appendChild(blogData);
			component.appendChild(container);
			break;
		}
		var like_btn;
		likes[i] = true;
		if (data.ProfileData.Posts[i].LikedBy[username] == undefined || !data.ProfileData.Posts[i].LikedBy[username]) {
			like_btn = {
				value : '<span id="like-span'+i+'" style="margin-top:0vw;color:'+WHITE+';">&#9829;</span>',
				backCol : LIKE_BTN_COL,
				owner : data,
				index : i,
				id : "like-btn"+i.toString(),
				onclick : function () {
					reverseExtreme($("like-span"+this.index),this)
					updateLike(this.owner,this.index,true);
				}
			}
		} else {
			like_btn = {
				value : '<span id="like-span'+i+'" style="margin-top:0vw;color:'+LIKE_BTN_COL+';">&#9829;</span>',
				backCol : WHITE,
				owner : data,
				index : i,
				id : "like-btn"+i.toString(),
				onclick : function () {
					reverseExtreme($("like-span"+this.index),this)
					updateLike(this.owner,this.index,!LikedBy[this.index][username]);
				}
			}
		}

		var comment_btn = {
			value : "<span class='fa fa-comment' id = 'message-span' style='margin:0vw;font-size:2vw;'></span>",
			backCol : BLUE,
			owner : data,
			index : i,
			id : "comment-btn",
			frontCol : WHITE,
			onclick : function () {
				openComments(this.owner,this.index);
			},
		}

		renderAndAddButtons([like_btn,comment_btn],container)
	}
}

reverseExtreme = (a,b) => {
	var c = b.style.backgroundColor;
	b.style.color = c;
	b.style.backgroundColor = a.style.color;
	a.style.color = c;
}

var span_data = []
function handleLikeBtnHoverEvents (data) {
	console.log(data)

	posts = data.ProfileData.Posts;
	if (posts == null) {
		posts = new Array();
	}
	for(var i=0;i<posts.length;i++) {
		console.log(span_data)
		var para = gen("p");
		para.id = "like-num"+i;
		console.log(para.id);
		para.style.position = "relative";
		para.style.left = "0%";
		para.style.top = "0%";
		para.style.color = "black";
		para.style.zIndex = "10";
		para.style.margin = "0%";
		para.style.display = "none";
		para.style.fontSize = '0.8vw';
		para.textContent = data.ProfileData.Posts[i].Likes.toString();

		$("like-btn"+i).appendChild(para)

		$("like-btn"+i).onmouseover = function () {
			console.log("like-num"+this.index);
			para.textContent = data.ProfileData.Posts[this.index].Likes.toString();
			$("like-span"+this.index).style.display = 'none';
			$("like-num"+this.index).style.display = 'block';
		}

		$("like-btn"+i).onmouseout = function () {
			console.log("rev");
			$("like-span"+this.index).style.display = 'block';
			$("like-num"+this.index).style.display = 'none';
		}
	}

}

renderAndAddButtons = (arr,component) => {
	var btn;
	for (var i = 0; i < arr.length; i++) {
		btn = gen("button");
		btn.innerHTML = arr[i].value;
		btn.style.backgroundColor = arr[i].backCol;
		btn.style.color = arr[i].frontCol;
		btn.owner = arr[i].owner;
		btn.onclick = arr[i].onclick

		if (arr[i].index != undefined) {
			btn.index = arr[i].index
		}

		if (arr[i].id != undefined) {
			btn.id = arr[i].id
		}

		component.appendChild(btn);
	}
}

getConnection = user => {
	var u_n = user.Username
	if (user.BasicData.Username == user_data.Username) {
		return "This is You"
	} else {
		var ret = "No Connection to You";
		if (user.SocialRelations.Friends[user_data.Username] != undefined) {
			ret = user.SocialRelations.Friends[user_data.Username].Affiliation;
			/*if (user.SocialRelations.Friends[user_data.Username].Nickname != undefined) {
				ret += ", whom you Lovingly call "+user.Nickname;
			}*/
		}
		return ret
	}
}

choose = (val,arg) => {

	if (val == null||val == undefined||val == "") {
		return "The "+arg+" has not been Provided";
	}

	return val;
}

openComments = async (user,index) => {
	$("modal-heading").textContent = "Comments";
	var innerDiv = gen("div")
	innerDiv.id = "inner-modal-space-div";
	innerDiv.className = "inner-modal-space-div"

	console.log(user.ProfileData.Posts[index].Comments)
	if (user.ProfileData.Posts[index].Comments == null) {
		var data = gen("p");
		data.id = 'rm-able-header'
		data.innerHTML = "<h1 style='padding-top:1.3vw;'><b>No one has commented on this post</b></h1><br><p style='text-align:center;padding-top:0.3vw;'>Be the first to comment !</p>";
		innerDiv.appendChild(data);
	} else {
		for (var i=0;i<user.ProfileData.Posts[index].Comments.length;i++) {
			var data = gen("p");
			data.innerHTML = user.ProfileData.Posts[index].Comments[i];
			innerDiv.appendChild(data);
		}
	}


	var btn = gen("div");
	btn.id = 'inner-modal-space-div-button'
	btn.style.backgroundColor = "#00ff44";
	btn.textContent = "Comment";
	btn.index = index
	btn.owner = user
	btn.onclick = function() {
		sendCommentDataToServer(this.owner,$('inner-modal-space-div-input').value,this.index,true)
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

updateLike = (my_user,index,update) => {
	var initializer = {
		r : "U+",
		g : username,
		c : my_user.BasicData.Username,
	}

	var likeReq = {
		c : "",
		pi : index,
		d : true,
	}

	if (update) {
		my_user.ProfileData.Posts[index].Likes ++
		my_user.ProfileData.Posts[index].LikedBy[username] = true;
		likes[index.toString()] = true
		console.log("adding a like")
		LikedBy[index][username] = true;
	} else {
		my_user.ProfileData.Posts[index].Likes --
		likes[index.toString()] = false
		initializer.r = "U-"
		my_user.ProfileData.Posts[index].LikedBy[username] = false;
		console.log("rm a like")
		LikedBy[index][username] = false;
	}
	console.log(LikedBy)

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


sendCommentDataToServer = (my_user,arg,index,update) => {
	var initializer = {
		r : "U+",
		g : username,
		c : my_user.BasicData.Username,
	}

	var likeReq = {
		c : arg,
		pi : index,
		d : false,
	}

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

		text = "<p><b>" + my_user.BasicData.Username + "</b><br>" + arg +"</p>"
		if (my_user.ProfileData.Posts[index].Comments == null) {
			my_user.ProfileData.Posts[index].Comments = []
		}
		if ($("rm-able-header") != null) {
			$("rm-able-header").remove()
		}
		my_user.ProfileData.Posts[index].Comments.push(text);
		empty_div = gen("div");
		empty_div.innerHTML =text;
		$('inner-modal-space-div').appendChild(empty_div);
		$('inner-modal-space-div').scrollTop = $('inner-modal-space-div').scrollHeight;
	};
}

friend = (good,my_user) => {
	console.log(good)
	var initializer = {
		r : "F+",
		g : username,
		c : my_user.BasicData.Username,
	}

	if (!good) {
		initializer.r = "F-"
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
		my_user.SocialRelations.Friends[username] = true;
		socket.close();
	};
}


LoadUserButtons = async (data,buttonRelay) => {
	buttonRelay.innerHTML = "";
	getSocialRelationDataAndBuildButtons(data,buttonRelay);

}

getSocialRelationDataAndBuildButtons = (data,buttonRelay) => {
	var request = {
		r : 'S+',
		g : "",
		c : data.BasicData.Username
	};

	var socket = new WebSocket('ws://'+IP+':'+PORT);

	if (!window.WebSocket) {
		alert("Your browser does not support web sockets");
	}

	socket.onerror = function(error) {
		//alert("Connection error either the server or you are offline");
	};

	socket.onopen = async function () {
		socket.send(JSON.stringify(request));
	};

	socket.onmessage = async function (event) {
		data.SocialRelations = JSON.parse(event.data);
		socket.close();

		ogDisplay =  buttonRelay.style.display;
		buttonRelay.style.opacity = "0";
		await sleep(250)
		buttonRelay.style.display = "none";
		if (Object.keys(data.SocialRelations.Friends).indexOf(username) != -1){
			frndButtonData = [{
					value  : "Unfollow",
					backCol  : RED,
					frontCol : WHITE,
					owner : data,
					onclick : function () {
						friend(false,this.owner);
						LoadUserButtons(this.owner,$("btn-relay"))
					}
				},{
					value : "Message",
					backCol : BLUE,
					frontCol : WHITE,
					owner : data.BasicData.Username,
					onclick : function () {
						make_PRVT_Chat(this.owner)
					}
				},/*{
					value : "Define Relation",
					backCol : PINK,
					frontCol : WHITE,
					owner : data.BasicData.Username,
					onclick : function () {
						defineRelation(this.owner)
					}
				},{
					value : "Bind Account",
					backCol : CYAN,
					frontCol : WHITE,
					owner : data.BasicData.Username,
					onclick : function () {
						bind(this.owner)
					}
				},{
					value : "See Sub Accounts",
					backCol : BLUE,
					frontCol : WHITE,
					owner : data.BasicData.Username,
					onclick : function () {
						getSubAccounts(this.owner)
					}
				},*/
			]
			renderAndAddButtons(frndButtonData,buttonRelay)
		} else if (Object.keys(data.SocialRelations.Followers).indexOf(username) != -1) {
			fllwrsButtonData = [
				{
					value  : "Unfollow",
					backCol  : RED,
					frontCol : WHITE,
					owner : data,
					onclick : function () {
						friend(false,this.owner);
						LoadUserButtons(this.owner,$("btn-relay"))
					}
				},/*{
					value : "Message",
					backCol : GRAY,
					frontCol : WHITE,
					owner : data,
					onclick : function () {
						if (this.owner.AccountType == PUBL) {
							make_PRVT_Chat(this.owner.BasicData.Username)
						} else {
							alert("The account is private, to message you will have to be a friend of the given user\
								and friending is mutual, so when "+this.owner.BasicData.Username+" follows you back this button\
								will turn Blue and thus become clickable")
						}
					}
				},/*{
					value : "Define Relation",
					backCol : PINK,
					frontCol : WHITE,
					owner : data.BasicData.Username,
					onclick : function () {
						defineRelation(this.owner)
					}
				},{
					value : "Bind Account",
					backCol : CYAN,
					frontCol : WHITE,
					owner : data.BasicData.Username,
					onclick : function () {
						bind(this.owner)
					}
				},{
					value : "See Sub Accounts",
					backCol : BLUE,
					frontCol : WHITE,
					owner : data.BasicData.Username,
					onclick : function () {
						getSubAccounts(this.owner)
					}
				},*/
			]

			if (data.AccountType == PUBL) {
				fllwrsButtonData[1].backCol = BLUE;
			}
			renderAndAddButtons(fllwrsButtonData,buttonRelay);
		} else if (data.BasicData.Username == username) {
				var meButtonData = [
				{
					value  : "Edit Account",
					backCol  : GRAY,
					frontCol : WHITE,
					owner : data.BasicData.Username,
					onclick : function () {
						renderComponent("Settings")
						updateUser()
					}
				}/*,{
					value : "See Root",
					backCol : BLUE,
					frontCol : WHITE,
					owner : data,
					onclick : function () {
						displayRoot(this.owner)
					}
				},*/
			]
			renderAndAddButtons(meButtonData,buttonRelay);
		} else {
			anonymButtonData = [{
					value  : "Follow",
					backCol  : GREEN,
					frontCol : WHITE,
					owner : data,
					onclick : function () {
						friend(true,this.owner);
						LoadUserButtons(this.owner,$("btn-relay"))
					}
				},/*{
					value : "Message",
					backCol : GRAY,
					frontCol : WHITE,
					owner : data,
					onclick : function () {
							alert("You can not message people you don't follow")
					}
				},{
					value : "Define Relation",
					backCol : GRAY,
					frontCol : WHITE,
					owner : data.BasicData.Username,
					onclick : function () {
						alert("You don't even follow this person")
					}
				},{
					value : "Bind Account",
					backCol : CYAN,
					frontCol : WHITE,
					owner : data.BasicData.Username,
					onclick : function () {
						bind(this.owner)
					}
				},{
					value : "See Sub Accounts",
					backCol : BLUE,
					frontCol : WHITE,
					owner : data.BasicData.Username,
					onclick : function () {
						getSubAccounts(this.owner)
					}
				},*/
			]
			renderAndAddButtons(anonymButtonData,buttonRelay);
		}
		buttonRelay.style.display = ogDisplay;
		await sleep(250)
		buttonRelay.style.opacity = "1";
	}
}
