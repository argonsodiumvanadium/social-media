package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"websocket"
)

type (
	SearchQuery struct {
		Name     string `json:"name"`
		Username string `json:"username"`
		Password string `json:"password"`
	}
)

func (self *Session) registerUser(writer http.ResponseWriter, reader *http.Request) {
	fmt.Println("\u001B[92mConnection \u001B[0m:", reader.RemoteAddr)

	upgrader.CheckOrigin = func(r *http.Request) bool {
		return true
	}

	socket, err = upgrader.Upgrade(writer, reader, nil)
	handleErr(err)

	self.activateReader(socket)
}

func (self *Session) activateReader(conn *websocket.Conn) {
	reg, msg := SearchQuery{}, "E"

	messageType, recv, err := conn.ReadMessage()
	handleErr(err)
	fmt.Println("\u001B[96mregistration-request\u001B[0m :", string(recv))

	err = json.Unmarshal(recv, &reg)
	handleErr(err)
	fmt.Println(self.Users)

	if reg.Name == "" {
		if self.Users[reg.Username] != nil {
			if self.Users[reg.Username].BasicData.Password == reg.Password {
				msg = reg.Username
				fmt.Println("\u001B[92m" + reg.Username + " Has entered\u001B[0m")
				self.setAsActive(reg.Username)
			} else if self.ActiveUsers[reg.Username] != nil {
				msg = "!"
			}
		}

	} else {
		if self.Users[reg.Username] == nil {
			msg = reg.Username
			self.buildUser(reg.Name, reg.Username, reg.Password)
			fmt.Println("\u001B[92m" + reg.Username + " Has entered\u001B[0m")
			self.setAsActive(reg.Username)
		}
	}

	fmt.Println("msg :", msg)

	handleErr(
		conn.WriteMessage(messageType, []byte(msg)),
	)
}
