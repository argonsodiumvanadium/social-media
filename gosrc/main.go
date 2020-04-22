package main

import (
	_"gopkg.in/yaml.v2"
	"encoding/json"
	"fmt"
	"encoding/gob"
	"io/ioutil"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"websocket"
)

/*

all database and search related code such as
 - search(riot)
 - session
are in file data.go

all user related structs such as
 - user
 - friends
 - events
 - post
 - hashtag
are in file user.go

all chat related structs/code like
 - Rooms
are in file chatting.go

the main switch case serve func is in serve.go

the register func is in register.go
*/

const (
	PORT = ":9000"

	USER_DIR = "Data/"
)

var (
	upgrader websocket.Upgrader
	socket   *websocket.Conn

	session *Session

	err error
)

func handleErr(e error) {
	if e != nil {
		fmt.Print("\u001B[91m")
		fmt.Println(e, "\u001B[0m")
		panic(e)
	}
}

func main() {
	defer session.saveData(USER_DIR)
	SetupCloseHandler()

	initPrereq()
	fmt.Println("\u001B[92mThe Server has started\u001B[0m")
	setUpRoutes()
	handleErr(
		http.ListenAndServe(PORT, nil),
	)
}

func initPrereq() {
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}

	initializeDefImages()
	session = startSession()
	session.restoreData(USER_DIR)
}

func setUpRoutes() {
	http.HandleFunc("/register", session.registerUser)
	http.HandleFunc("/chat", session.joinRoom)
	http.HandleFunc("/settings", session.editUser)
	http.HandleFunc("/", session.serve)
}

func (self *Session) editUser (writer http.ResponseWriter, reader *http.Request) {
	fmt.Println("settings")
	upgrader.CheckOrigin = func(r *http.Request) bool {
		return true
	}

	conn, err := upgrader.Upgrade(writer, reader, nil)
	handleErr(err)
	mType,msg,err := conn.ReadMessage()
	handleErr(err)

	u := &self.Users[string(msg)].BasicData

	val,err := json.Marshal(*u)
	handleErr(err)
	conn.WriteMessage(mType,val)

	_,user,err := conn.ReadMessage()
	err = json.Unmarshal(user,*u)
	fmt.Printf("%+v",self.Users[string(msg)].BasicData.ProfilePic)
	handleErr(err)
}

func SetupCloseHandler() {
	c := make(chan os.Signal)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-c
		session.saveData(USER_DIR)
		os.Exit(0)
	}()
}

func (self *Session) restoreData(dirname string) {
	files,err := ioutil.ReadDir(dirname)
	handleErr(err)
	for _,file := range(files) {
		file, err := os.OpenFile(dirname+file.Name(), os.O_RDWR, 0700)
		handleErr(err)
		decoder := gob.NewDecoder(file)
		user := &User{}
		handleErr(decoder.Decode(user))

		self.Users[user.BasicData.Username] = user
		self.AddStringToSearch(user.BasicData.Username,user.BasicData.Name)
	
		for index,val := range(user.MessagingEssentials.Rooms) {
			session.RoomStorage[index] = val
		}
	}
}

func (self *Session) saveData(dirname string) {
	for key,val := range(session.Users) {
		fmt.Print("\nSaving "+key)
		file, err := os.OpenFile(dirname+key, os.O_CREATE, 0700)
		handleErr(err)
		file.Close()
		file, err = os.OpenFile(dirname+key, os.O_WRONLY, 0700)
		handleErr(err)
		encoder := gob.NewEncoder(file)
		handleErr(encoder.Encode(val))
		file.Close()
	}
}
