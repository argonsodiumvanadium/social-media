package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"websocket"
)

type (
	Request struct {
		Req       string `json:"r"`
		Generator string `json:"g"` //the person who fired the request
		Consumer  string `json:"c"` //the person for whom it was fired
	}

	PostUpdateData struct {
		Comment    string `json:"c"`
		PostIndex  int    `json:"pi"`
		ChangeLike bool   `json:"d"`
	}

	RoomCreationData struct {
		Name string            `json:"n"`
		Admin string           `json:"a"`
		Participants []string  `json:"p"`
	}

)

const (
	GET_PROF_DATA    = "P"
	GET_BASIC_DATA   = "B"
	GET_SOC_REL_DATA = "S+"
	GET_FEED_HANDLER = "F"
	GET_SUPP_DATA    = "s"
	GET_MSG_ESSENT   = "M+"
	GET_FEED         = "F*"

	CREATE_ROOM      = "R+"
	GET_ROOM_DATA    = "R#"
	JOIN_ROOM        = "r#"
	EDIT_ROOM        = "ER"

	RESUME_FEED      = "f*"

	SEARCH = "S"
	BYE    = "b"
	POST   = "p+"

	FOLLOW = "F+"
	UNFOLL = "F-"

	UPDATE_POST_POS = "U+"
	UPDATE_POST_NEG = "U-"
)

func (self *Session) serve(writer http.ResponseWriter, reader *http.Request) {
	fmt.Println("\u001B[92mServe Connection \u001B[0m:", reader.RemoteAddr)

	upgrader.CheckOrigin = func(r *http.Request) bool {
		return true
	}

	socket, err = upgrader.Upgrade(writer, reader, nil)
	handleErr(err)

	self.makeReader(socket)
}

func (self *Session) makeReader(conn *websocket.Conn) {
	request, msg := Request{}, []byte("")

	messageType, recv, err := conn.ReadMessage()
	fmt.Println("object :",string(recv))
	handleErr(err)
	err = json.Unmarshal(recv, &request)

	fmt.Println("\u001B[96mrequest\u001B[0m : BY-", request.Generator, "FOR-", request.Consumer, "TODO-", request.Req)
	handleErr(err)

	msg = request.ChooseAction(self, conn)
	handleErr(
		conn.WriteMessage(messageType,msg),
	)
}

func (self Request) ChooseAction(call_session *Session, reader *websocket.Conn) []byte {
	switch self.Req {
	case GET_BASIC_DATA:
		return call_session.Users[self.Consumer].getBasicData()
	case GET_FEED_HANDLER:
		return call_session.Users[self.Consumer].getFeedHandlerData()
	case GET_PROF_DATA:
		return call_session.Users[self.Consumer].getProfileData()
	case GET_SOC_REL_DATA:
		return call_session.Users[self.Consumer].getSocialRelations()
	case GET_SUPP_DATA:
		return call_session.Users[self.Consumer].getSupportingData()
	case GET_MSG_ESSENT:
		return call_session.Users[self.Consumer].getMessagingEssentials()
	case GET_FEED:
		return call_session.Users[self.Generator].supplyFeedTo(reader)
	case RESUME_FEED:
		return call_session.Users[self.Generator].resumeFeedFor(reader)
	case CREATE_ROOM:
		_,msg,err := reader.ReadMessage()
		handleErr(err)
		rcd := &RoomCreationData{}
		handleErr(json.Unmarshal(msg,rcd))
		call_session.Users[self.Generator].createRoom(rcd.Name,rcd.Participants)
		name := call_session.Users[self.Generator].MessagingEssentials.Rooms[id-1].Name
		return []byte(name)
	case GET_ROOM_DATA:
		val,err := json.Marshal(session.Users[self.Generator].MessagingEssentials.RoomsByName[self.Consumer])
		handleErr(err)
		fmt.Printf("%+v\n",session.Users[self.Generator].MessagingEssentials)
		return val
	case EDIT_ROOM:
		val,err := json.Marshal(session.Users[self.Generator].MessagingEssentials.RoomsByName[self.Consumer])
		handleErr(err)
		return val
	case SEARCH:
		res := call_session.SearchForString(self.Consumer)
		ans, err := json.Marshal(res)
		handleErr(err)
		return []byte(ans)
	case POST:
		_, postJSONData, err := reader.ReadMessage()
		handleErr(err)
		var post Post
		handleErr(json.Unmarshal(postJSONData, &post))
		call_session.Users[self.Generator].PostData(&post)
	case FOLLOW:
		fmt.Println("Follow")
		call_session.Users[self.Generator].Follow(call_session.Users[self.Consumer])
	case UNFOLL:
		call_session.Users[self.Generator].Unfollow(call_session.Users[self.Consumer])
	case UPDATE_POST_POS:
		_, postJSONData, err := reader.ReadMessage()
		handleErr(err)
		var updata PostUpdateData
		handleErr(json.Unmarshal(postJSONData, &updata))
		if updata.ChangeLike {
			call_session.Users[self.Generator].Like(self.Consumer, updata.PostIndex)
		}
		if updata.Comment != "" {
			fmt.Println(updata.Comment)
			updata.Comment = "<b>" + self.Generator + "</b><br>" + updata.Comment;
			call_session.Users[self.Generator].Comment(self.Consumer, updata.PostIndex, updata.Comment)
		}
	case UPDATE_POST_NEG:
		_, postJSONData, err := reader.ReadMessage()
		handleErr(err)
		var updata PostUpdateData
		handleErr(json.Unmarshal(postJSONData, &updata))
		if updata.ChangeLike {
			fmt.Println("Removing likes")
			call_session.Users[self.Generator].DeLike(self.Consumer, updata.PostIndex)
		}
		if updata.Comment != "" {
			call_session.Users[self.Generator].Uncomment(self.Consumer, updata.PostIndex, updata.Comment)
		}

	case BYE:
		call_session.setAsInactive(self.Generator)
	default:
		fmt.Println("Unknown Command")
	}

	return []byte("")
}
