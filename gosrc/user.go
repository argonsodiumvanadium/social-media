package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"websocket"
	"time"
)

type (
	//structs for pure json
	BasicData struct {
		Username, Name string
		Password       string `json:"-"`
		ProfilePic     *Post
		Bio            string
		Gender         string
		BackGroundImg  string
		DisplayName    string
		RoomNames    []string
	}

	FeedHandler struct {
		Feed     []**Post
		SeenFeed int
		Featured []*Post
		Trending []*Post

		Events       []*Event //stack
		ActiveEvents []*Event //stack
		MyHashTags   []*HashTag
		FollowedTags []*HashTag
	}

	ProfileData struct {
		ContactInfo   map[string][]string
		MoreAbtMe     []string
		MutualFriends map[string]int
		BlockedBy     map[string]string
		Blocked       map[string]string
		JoinDate      string
		LastActive    string
		Posts         []*Post //it can crash the whole thing
	}

	SupportingData struct {
		Activity     []string
		SeenActivity int

		NewEvents, NewActivity bool

		Notes []string
	}

	RelationHandler struct {
		ParentProfile string
		ChildProfiles map[string][]string

		Subscribers map[string]bool
	}

	SocialRelations struct {
		Friends   map[string]*Friend
		Following map[string]bool
		Followers map[string]bool
	}

	MessagingEssentials struct {
		Rooms       map[int]*Room
		RoomsByName map[string]*Room
		NewMessages map[string]bool
	}

	User struct {
		AccountType string //like public and priv
		Usage       string

		BasicData           *BasicData
		FeedHandler         *FeedHandler
		ProfileData         *ProfileData
		SupportingData      *SupportingData
		RelationHandler     *RelationHandler
		MessagingEssentials *MessagingEssentials
		SocialRelations     *SocialRelations
	}

	Friend struct {
		Attatchment int //0 - 1000
		PrivateChat *Room
		Username    string
		Nickname    string
		Affiliation string
	}

	Event struct {
		Name        string
		Access      string //only public and private apply here
		Post        string
		Description string

		Participants []string
		MeetingRoom  *Room
		Hosts        []string
	}

	Post struct {
		Type               string
		Data               string
		Caption            string
		Comments           []string
		Likes, Unlikes     int
		LikedBy, UnlikedBy map[string]bool
		Owner              string
		Index              int
	}

	HashTag struct {
		Name  string
		Posts []*Post
	}
)

const (
	//user type (for machine)
	ROOT = "r"
	SUBP = "s"

	//user types (for user actions)
	NORM = "n"
	ADDS = "a"
	BLOG = "b"
	WORK = "w"

	//user types (as per privacy)
	PUBL = "p" //all information is dhown
	PRIV = "P" //the account is to be requested
	//VPRV = "P+"  //the extra info is only shown to close friends
	//VVPR = "P++" //even the bare essentials are only shown to close friends

	//post types
	// BLOG = "b"
	VID  = "v"
	IMG  = "i"
	INTR = "I" //an interactive html and js post

	DEF_ATTATCHMENT = 250

	PROF_PIC_LOC = "../Defs/DEF_USER.png"

	//feed types
	TRNDING = "T+"
	NORM_F = "NF"
	FEATU = "F#"
	BREAK = "BR"
)

var (
	def_profile *Post
	feed []**Post
)

func currTime() string {
	return time.Now().Format("Mon Jan _2 15:04:05 2006")
}

func (self *Session) buildUser(name, username, password string) {
	time := currTime()

	user := User{
		AccountType: PUBL,
	}

	user.BasicData = &BasicData{
		Name:       name,
		Username:   username,
		Password:   password,
		ProfilePic: &Post {
			Data : def_profile.Data,
			Owner : username,
		},
	}

	user.ProfileData = &ProfileData{
		BlockedBy:   make(map[string]string),
		Blocked:     make(map[string]string),
		ContactInfo: make(map[string][]string),

		JoinDate:   time,
		LastActive: time,

		MutualFriends: make(map[string]int),
	}

	user.SupportingData = &SupportingData{
		SeenActivity: 0,
		Activity:     make([]string, 1),
	}

	user.FeedHandler = &FeedHandler{
		SeenFeed: 0,
	}

	user.SocialRelations = &SocialRelations{
		Friends:   make(map[string]*Friend),
		Following: make(map[string]bool),
		Followers: make(map[string]bool),
	}

	user.RelationHandler = &RelationHandler{
		ChildProfiles: make(map[string][]string),
		Subscribers:   make(map[string]bool),
	}

	user.MessagingEssentials = &MessagingEssentials{
		Rooms:       make(map[int]*Room),
		RoomsByName: make(map[string]*Room),
		NewMessages: make(map[string]bool),
	}

	user.SupportingData.Activity[0] = "<span style='color:#00ff44;'>You Joined This Social Media Platform</span>"

	self.Users[username] = &user

	self.AddStringToSearch(username, name)
}

func (self *User) getFeedHandlerData() []byte {
	fmt.Println("JSONING starting")
	//self.FeedHandler.Trending = session.Trending

	val, err := json.Marshal(self.FeedHandler)
	handleErr(err)

	fmt.Println("JSONING done")
	return val
}

/*func (self *User) supplyFeedTo (conn *websocket.Conn) {
	trending,feed := session.Trending,self.FeedHandler.Feed;
	msgType,data,err := conn.ReadMessage()
	handleErr(err)
	if string(data) == TRNDING {
		if len(trending) < 15 {
			val,err := json.Marshal(trending[15:])
			handleErr(err)
			conn.WriteMessage(msgType,val)
			conn.WriteMessage(msgType,[]byte(BREAK))
			conn.Close()
			break
		}
		val,err := json.Marshal(trending[15:])
		handleErr(err)
		conn.WriteMessage(msgType,val)
		trending = trending[:16]
	} else if string(data) == NORM_F {
		if len(feed) < 15 {
			val,err := json.Marshal(feed[15:])
			handleErr(err)
			conn.WriteMessage(msgType,val)
			conn.WriteMessage(msgType,[]byte(BREAK))
			conn.Close()
			break
		}
		val,err := json.Marshal(feed[15:])
		handleErr(err)
		conn.WriteMessage(msgType,val)
		feed = feed[:16]
	} else if string(data) == BREAK {
		conn.Close()
		break
	}
}*/

func getUnique(slice []string) []string {
    keys := make(map[string]bool)
    list := []string{}
    for _, entry := range slice {
        if _, value := keys[entry]; !value {
            keys[entry] = true
            list = append(list, entry)
        }
    }
    return list
}

func (self *User) supplyFeedTo (conn *websocket.Conn) ([]byte) {
	feed = self.FeedHandler.Feed;

	msgType,_,err := conn.ReadMessage()
	handleErr(err)
	fmt.Println("sub ",len(self.RelationHandler.Subscribers))

	if len(feed) == 0 {
		handleErr(conn.WriteMessage(msgType,[]byte("B")))
	} else if len(feed) < 15 {
		val,err := json.Marshal(feed)
		feed = feed[:len(feed)]
		handleErr(err)
		handleErr(conn.WriteMessage(msgType,val))
	} else {
		val,err := json.Marshal(feed[:len(feed)-15])
		handleErr(err)
		feed = feed[15:]
		handleErr(conn.WriteMessage(msgType,val))
	}
	return []byte("")
}

func (self *User) resumeFeedFor (conn *websocket.Conn) ([]byte) {
	msgType,_,err := conn.ReadMessage()
	handleErr(err)
	fmt.Println("sub ",len(self.RelationHandler.Subscribers))

	if len(feed) == 0 {
		handleErr(conn.WriteMessage(msgType,[]byte("B")))
	} else if len(feed) < 15 {
		val,err := json.Marshal(feed)
		feed = feed[:len(feed)]
		handleErr(err)
		handleErr(conn.WriteMessage(msgType,val))
	} else {
		val,err := json.Marshal(feed[:len(feed)-15])
		handleErr(err)
		feed = feed[15:]
		handleErr(conn.WriteMessage(msgType,val))
	}
	return []byte("")
}

func (self *User) getSupportingData() []byte {
	self.SupportingData.SeenActivity = (len(self.SupportingData.Activity)) - (1)

	val, err := json.Marshal(&self.SupportingData)
	handleErr(err)

	return val
}

func (self *User) getMessagingEssentials() []byte {
	val, err := json.Marshal(&self.MessagingEssentials)
	handleErr(err)

	return val
}

func (self *User) getBasicData() []byte {
	self.BasicData.RoomNames = getUnique(self.BasicData.RoomNames)
	val, err := json.Marshal(self.BasicData)
	handleErr(err)
	return val
}

func (self *User) getProfileData() []byte {
	val, err := json.Marshal(self)
	handleErr(err)
	return val
}

func (self *User) getSocialRelations() []byte {
	fmt.Printf("%+v",self)
	val, err := json.Marshal(*self.SocialRelations)
	handleErr(err)
	return val
}

func initializeDefImages() {
	data, err := ioutil.ReadFile(PROF_PIC_LOC)
	handleErr(err)
	enc := base64.StdEncoding.EncodeToString([]byte(data))

	def_profile = &Post{
		Type: IMG,
		Data: enc,
	}
}

func (self *User) PostData(post *Post) {
	post.Owner = self.BasicData.Username
	post.LikedBy = make(map[string]bool)
	post.UnlikedBy = make(map[string]bool)
	post.Index = len(self.ProfileData.Posts)

	posts := self.ProfileData.Posts
	self.ProfileData.Posts = append(posts, post)
	//session.UniversalPostChannel <- post
	fmt.Printf("%p",self.ProfileData.Posts[len(self.ProfileData.Posts)-1])
	go self.broadcast(&self.ProfileData.Posts[len(self.ProfileData.Posts)-1])
}

func (self *User) broadcast (post **Post) {
	fmt.Println("BROADCASTING")
	for val,_ := range(self.RelationHandler.Subscribers) {
		fmt.Println("bef",session.Users[val].FeedHandler.Feed)
		session.Users[val].FeedHandler.Feed = append(session.Users[val].FeedHandler.Feed,post)
		fmt.Println("aff",session.Users[val].FeedHandler.Feed)
	}

	var post_type string
	switch (**post).Type {
	case IMG:
		post_type = "Picture"
	case BLOG:
		post_type = "Blog"
	case VID:
		post_type = "Video"
	case INTR:
		post_type = "Interactive Snippet"
	}

	self.SupportingData.Activity = append(self.SupportingData.Activity, "You posted a new "+post_type)
	self.SupportingData.NewActivity = true
}

func (self *User) Follow(target *User) {
	if _, ok := target.SocialRelations.Following[self.BasicData.Username]; ok {
		delete(target.SocialRelations.Following, self.BasicData.Username)
		target.SocialRelations.Friends[self.BasicData.Username] = &Friend{
			Attatchment: DEF_ATTATCHMENT,
			Username:    self.BasicData.Username,
			Affiliation : "This is your Friend",
		}

		self.SocialRelations.Friends[target.BasicData.Username] = &Friend{
			Attatchment: DEF_ATTATCHMENT,
			Username:    target.BasicData.Username,
			Affiliation : "This is your Friend",
		}

		self.SupportingData.Activity = append(self.SupportingData.Activity, "You and "+target.BasicData.Username+" are now <span style='color:#00ff44;'>Friends</span>")
		target.SupportingData.Activity = append(target.SupportingData.Activity, "You and "+self.BasicData.Username+" are now <span style='color:#00ff44;'>Friends</span>")

		if _,ok := self.SocialRelations.Followers[target.BasicData.Username];ok {
			delete(self.SocialRelations.Followers,target.BasicData.Username)
		} else {
			delete(target.SocialRelations.Followers,self.BasicData.Username)
		}
	} else {
		target.SocialRelations.Followers[self.BasicData.Username] = true
		self.SocialRelations.Following[target.BasicData.Username] = true
		self.SupportingData.Activity = append(self.SupportingData.Activity, "You started <span style='color:#00ff44;'>Following</span> "+target.BasicData.Username)
		target.SupportingData.Activity = append(target.SupportingData.Activity, self.BasicData.Username+" started <span style='color:#00ff44;'>Following</span> You")
	}

	go func() {
		self.ProfileData.MutualFriends[target.BasicData.Username] = self.FindMutualFriends(target)
		target.ProfileData.MutualFriends[self.BasicData.Username] = self.ProfileData.MutualFriends[target.BasicData.Username]
	}()
	self.SupportingData.NewActivity = true
	self.Subscribe(target)
}

func (self *User) Unfollow(target *User) {
	if _, ok := target.SocialRelations.Friends[self.BasicData.Username]; ok {
		delete(target.SocialRelations.Friends, self.BasicData.Username)
		delete(self.SocialRelations.Friends, target.BasicData.Username)
		target.SocialRelations.Following[self.BasicData.Username] = true
		self.SocialRelations.Followers[target.BasicData.Username] = true
	} else {
		delete(target.SocialRelations.Followers, self.BasicData.Username)
		delete(target.SocialRelations.Following, target.BasicData.Username)
	}

	target.SupportingData.Activity = append(target.SupportingData.Activity, "You were <span style='color:#ff3300;'>Unfollowed</span> by "+self.BasicData.Username)
	self.SupportingData.Activity = append(self.SupportingData.Activity, "You <span style='color:#ff3300;'>Unfollowed </span>"+target.BasicData.Username)
	self.SupportingData.NewActivity = true

	self.Unsubscribe(target)
}

func (self *User) Like(username string, postIndex int) {
	user := session.Users[username]
	fmt.Println(postIndex)
	user.ProfileData.Posts[postIndex].Likes ++
	user.ProfileData.Posts[postIndex].LikedBy[self.BasicData.Username] = true
	fmt.Println(user.ProfileData.Posts[postIndex].Likes)
	fmt.Println(postIndex)
	user.SupportingData.Activity = append(user.SupportingData.Activity, "Your Post captioned "+user.ProfileData.Posts[postIndex].Caption+" was <span style='color:#ff0333;'>Liked By</span> "+self.BasicData.Username)
	self.SupportingData.NewActivity = true
}

//undo a like
func (self *User) DeLike(username string, postIndex int) {
	user := session.Users[username]
	if _, ok := user.ProfileData.Posts[postIndex].LikedBy[self.BasicData.Username]; ok {
		user.ProfileData.Posts[postIndex].Likes --
		user.ProfileData.Posts[postIndex].LikedBy[self.BasicData.Username] = false
		go func() {
			for i := 0; i < len(user.SupportingData.Activity); i++ {
				if user.SupportingData.Activity[i] == "Your Post captioned "+user.ProfileData.Posts[postIndex].Caption+" was <span style='color:#ff0333;'>Liked By</span> "+self.BasicData.Username {
					user.SupportingData.Activity = append(user.SupportingData.Activity[:i], user.SupportingData.Activity[i+1:]...)
					self.SupportingData.NewActivity = ((len(user.SupportingData.Activity)) > self.SupportingData.SeenActivity)
					break
				}
			}
		}()
	}
}

func (self *User) Unlike(username string, postIndex int) {
	user := session.Users[username]
	user.ProfileData.Posts[postIndex].Unlikes++
	user.ProfileData.Posts[postIndex].UnlikedBy[self.BasicData.Username] = true

	user.SupportingData.Activity = append(user.SupportingData.Activity, "Your Post was <span style='color:#ff3300;'>UnLiked By</span> "+self.BasicData.Username)
	self.SupportingData.NewActivity = true
}

func (self *User) DeUnlike(username string, postIndex int) {
	user := session.Users[username]
	if _, ok := user.ProfileData.Posts[postIndex].UnlikedBy[self.BasicData.Username]; ok {
		user.ProfileData.Posts[postIndex].Unlikes--
		user.ProfileData.Posts[postIndex].UnlikedBy[self.BasicData.Username] = false
		for i := 0; i < len(user.SupportingData.Activity); i++ {
			if user.SupportingData.Activity[i] == "Your Post was <span style='color:#ff3300;'>UnLiked By</span> "+self.BasicData.Username {
				user.SupportingData.Activity = append(user.SupportingData.Activity[:i], user.SupportingData.Activity[i+1:]...)
				self.SupportingData.NewActivity = ((len(user.SupportingData.Activity)) > self.SupportingData.SeenActivity)
				break
			}
		}
	}
}

func (self *User) Comment(username string, postIndex int, Comment string) {
	user := session.Users[username]
	user.ProfileData.Posts[postIndex].Comments = append(user.ProfileData.Posts[postIndex].Comments, Comment)

	user.SupportingData.Activity = append(user.SupportingData.Activity,self.BasicData.Username+" <span style='color:#0044ff;'>Commented</span> On Your Post Saying <br>"+Comment)
	self.SupportingData.NewActivity = true
}

func (self *User) Uncomment(username string, postIndex int, Comment string) {
	user := session.Users[username]
	for i := 0; i < len(user.SupportingData.Activity); i++ {
		if user.SupportingData.Activity[i] == self.BasicData.Username+" <span style='color:#0044ff;'>Commented</span> On Your Post Saying <br>"+Comment {
			user.SupportingData.Activity = append(user.SupportingData.Activity[:i], user.SupportingData.Activity[i+1:]...)
			self.SupportingData.NewActivity = ((len(user.SupportingData.Activity)) > self.SupportingData.SeenActivity)
			break
		}
	}
}

func (self *User) FindMutualFriends(args ...*User) int {
	mut := 0

	for _, f1 := range self.SocialRelations.Friends {
		for _, f2 := range session.Users[f1.Username].SocialRelations.Friends {
			for _, arg := range args {
				if arg.BasicData.Username == f2.Username {
					mut++
				}
			}
		}
	}

	return mut
}
