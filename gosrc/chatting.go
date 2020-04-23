package main

import (
	"fmt"
	"encoding/json"
	"net/http"
	"strconv"
)

type (

	Room struct {
		SubRooms []string
		ParentRoom string
		Participants []string
		Admins []string
		Messages []string  `json:"-"`
		Id int
		//Access string
		BannedUsers []string
		RoomCap int
		Name string
	}
)

const (
	MORE_MSG_PLZ = "+"
)

var (
	id = 0
)

func (self *User) createRoom (name/*,access*/ string,membs []string) {
	room := Room {
		Id : id+1,
		Name : name,
		Admins : make([]string,0),
		//Access : access,
		Participants : membs,
	}
	room.Admins = append(room.Admins,self.BasicData.Username)
	session.RoomStorage[id] = &room 
	id ++
	go func() {
		addr := &room
		for i := 0; i < len(room.Participants); i++ {
			session.Users[room.Participants[i]].SupportingData.Activity = append(session.Users[room.Participants[i]].SupportingData.Activity,
				"You were added to a room called <span style='color:#00ddff'>"+room.Name+"</span> by "+room.Admins[0])
			session.Users[room.Participants[i]].BasicData.RoomNames = append(session.Users[room.Participants[i]].BasicData.RoomNames,room.Name)
			session.Users[room.Participants[i]].MessagingEssentials.RoomsByName[room.Name] = addr
			session.Users[room.Participants[i]].MessagingEssentials.Rooms[room.Id] = addr
			fmt.Println("adding name to ",room.Participants[i],"\n",session.Users[room.Participants[i]].BasicData.RoomNames)
		}
	}()
}

func (self *Session) joinRoom (writer http.ResponseWriter, reader *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool {
		return true
	}

	conn, err := upgrader.Upgrade(writer, reader, nil)
	handleErr(err)
	mType,val,err := conn.ReadMessage()

	roomIndex,err := strconv.Atoi(string(val))
	handleErr(err)

	fmt.Printf("%+v\n",*self.RoomStorage[roomIndex])
	session.ActiveChannels[roomIndex] = append(session.ActiveChannels[roomIndex],conn)
	r := self.RoomStorage[roomIndex]
	room := &r
	messages := make([]string,0)
	fmt.Printf("%+v\n",**room)
	if (**room).Messages != nil {
		messages = (**room).Messages
	}

	defer recover()

	for {
		mType,val,err = conn.ReadMessage()
		handleErr(err)
		fmt.Printf(string(val)+"\n")
		switch string(val) {
		case MORE_MSG_PLZ:
			if len(messages) > 30 {
				val,err := json.Marshal(messages[len(messages)-30:])
				handleErr(err)
				messages = messages[:len(messages)-29];
				fmt.Println(messages)
				conn.WriteMessage(mType,val)
			} else if len(messages) == 0 {
				conn.WriteMessage(mType,[]byte("B"))
			} else {
				val,err := json.Marshal(messages)
				handleErr(err)
				messages = make([]string,0)
				conn.WriteMessage(mType,val)
			}

		default:

			for i := 0; i < len(session.ActiveChannels[(**room).Id]); i++ {
				session.ActiveChannels[(**room).Id][i].WriteMessage(mType,val)
			}
			(**room).Messages = append((**room).Messages,string(val))
		}
	}
	conn.Close()
}