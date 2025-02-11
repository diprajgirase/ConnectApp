import { Tabs } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react'

const TabRoot = () => {
  return (
  <Tabs>
    <Tabs.Screen name= "index" options={{title:"Explore" ,tabBarIcon: ({ color }) => <FontAwesome size={28} name="search" color={color} />,}} />
    <Tabs.Screen name= "matches" options={{title:"Matches" ,tabBarIcon: ({ color }) => <FontAwesome size={28} name="heart" color={color} />,}} />
    <Tabs.Screen name= "chats" options={{title:"Chats",tabBarIcon: ({ color }) => <FontAwesome size={28} name="comment" color={color} />,}}/>
    <Tabs.Screen name= "profile" options={{title:"Profile" ,tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />,}}/>
  </Tabs>
  )
}

export default TabRoot;