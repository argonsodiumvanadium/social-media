package main

import (
	"fmt"
	"websocket"
)

type (
	Session struct {
		Users                map[string]*User
		SearchEngine         map[string][]*UserDataPacket
		ActiveUsers          map[string]*User
		Itr                  int
		Trending             []*Post
		UniversalPostChannel chan *Post
		RoomStorage          map[int]*Room
		ActiveChannels       map[int][]*websocket.Conn
	}

	UserDataPacket struct {
		Username string `json:"username"`
		Name     string `json:"name"`
	}
)

func startSession() *Session {
	this := Session{
		make(map[string]*User),
		buildSearchEngine(),
		make(map[string]*User),
		1,
		make([]*Post, 0),
		make(chan *Post),
		make(map[int]*Room),
		make(map[int][]*websocket.Conn),
	}
	//go (&this).TrendCollector()
	return &this
}

func buildSearchEngine() map[string][]*UserDataPacket {
	engine := make(map[string][]*UserDataPacket)

	return engine
}

func (self *Session) AddStringToSearch(username, name string) {
	result := make(map[string]bool)

	for i := 0; i < len(username); i++ {
		for j := 0; j < len(username); j++ {
			if j+i < len(username) {
				result[username[j:j+i+1]] = true
			}
		}
	}

	for i := 0; i < len(name); i++ {
		for j := 0; j < len(name); j++ {
			if j+i < len(name) {
				result[name[j:j+i+1]] = true
			}
		}
	}

	for key, _ := range result {
		self.SearchEngine[key] = append(self.SearchEngine[key],
			&UserDataPacket{
				username,
				name,
			},
		)
	}
}

func (self *Session) SearchForString(str string) interface{} {
	data := self.SearchEngine[str]

	fmt.Println("data :", data)
	return data
}

func (self *Session) setAsActive(username string) {
	self.ActiveUsers[username] = self.Users[username]
	self.Users[username].ProfileData.LastActive = "<span style='color:#00ff44;'>currently online</span>"
}

func (self *Session) setAsInactive(username string) {
	if _, ok := self.ActiveUsers[username]; ok {
		delete(self.ActiveUsers, username)
	}

	self.Users[username].ProfileData.LastActive = currTime()
}
