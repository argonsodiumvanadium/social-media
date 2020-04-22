package main

/*
A very integral part of the program this
will sort and create suitable feeds for people
*/

//based on pub-sub
func (subscriber *User) Subscribe(target *User) {
	target.RelationHandler.Subscribers[subscriber.BasicData.Username] = true
}

func (self *Session) TrendCollector() {
	
}

func QuickSort(list []*Post) []*Post {
	if len(list) < 2 {
		return list
	}

	var left []*Post
	var right []*Post

	p := len(list) - 1
	v := list[p]

	list = append(list[:p])

	for i := 0; i < len(list); i++ {
		if list[i].Likes < v.Likes {
			left = append(left, list[i])
		} else {
			right = append(right, list[i])
		}
	}

	left = QuickSort(left)
	right = QuickSort(right)

	return append(append(left, []*Post{v}...), right...)
}

func (subscriber *User) Unsubscribe(target *User) {
	if _, ok := target.RelationHandler.Subscribers[subscriber.BasicData.Username]; ok {
		delete(target.RelationHandler.Subscribers, subscriber.BasicData.Username)
	}
}
