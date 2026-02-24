import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll_area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown_menu';
import {
  Send,
  Smile,
  Paperclip,
  Image as ImageIcon,
  Video,
  Phone,
  MoreVertical,
  Search,
  Users,
  UserPlus,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Volume2,
  Settings,
  Archive,
  Pin,
  Camera,
  File,
  Gift,
  MapPin,
  Calendar,
  Clock,
  CheckCheck,
  Check,
  Heart,
  Laugh,
  ThumbsUp,
  Star,
  MessageCircle
} from 'lucide-react';

interface ChatProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  lastSeen?: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  isTyping?: boolean;
  isPinned?: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'event';
  isRead: boolean;
  reactions?: { emoji: string; users: string[] }[];
  replyTo?: {
    id: string;
    content: string;
    sender: string;
  };
  file?: {
    name: string;
    size: string;
    type: string;
    url: string;
  };
  location?: {
    name: string;
    coordinates: { lat: number; lng: number };
  };
  isEdited?: boolean;
}

interface GroupChat {
  id: string;
  name: string;
  avatar: string;
  members: Contact[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isActive: boolean;
}

const contacts: Contact[] = [
  {
    id: '1',
    name: 'Vedika Salunke',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332f1f8?w=100&h=100&fit=crop&crop=face',
    status: 'online',
    unreadCount: 3,
    lastMessage: 'Hey! Are we still on for coffee tomorrow?',
    lastMessageTime: '2m ago',
    isTyping: false,
    isPinned: true
  },
  {
    id: '2',
    name: 'Shivam Singh',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    status: 'online',
    unreadCount: 0,
    lastMessage: 'Thanks for the help today! 👍',
    lastMessageTime: '15m ago',
    isTyping: true
  },
  {
    id: '3',
    name: 'Aditya Patro',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    status: 'away',
    unreadCount: 1,
    lastMessage: 'Check out this amazing sunset! 🌅',
    lastMessageTime: '1h ago'
  },
  {
    id: '4',
    name: 'Abdulharis Shaikh',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    status: 'offline',
    lastSeen: '2h ago',
    unreadCount: 0,
    lastMessage: 'See you at the meeting!',
    lastMessageTime: '3h ago'
  },
  {
    id: '5',
    name: 'Rahul Anchan',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    status: 'online',
    lastSeen: '2 minutes ago',
    unreadCount: 0,
    lastMessage: 'See you at the party!',
    lastMessageTime: '1h ago'
  }
];

const groupChats: GroupChat[] = [
  {
    id: '1',
    name: 'Team Brainstorm',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop',
    members: contacts.slice(0, 3),
    lastMessage: 'Sarah: Great ideas everyone!',
    lastMessageTime: '30m ago',
    unreadCount: 5,
    isActive: true
  },
  {
    id: '2',
    name: 'Weekend Plans',
    avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=100&h=100&fit=crop',
    members: contacts.slice(1, 4),
    lastMessage: 'Mike: Who\'s up for hiking?',
    lastMessageTime: '2h ago',
    unreadCount: 2,
    isActive: false
  }
];

const messages: Message[] = [
  {
    id: '1',
    senderId: '1',
    content: 'Hey! How are you doing today?',
    timestamp: '10:30 AM',
    type: 'text',
    isRead: true
  },
  {
    id: '2',
    senderId: 'me',
    content: 'I\'m doing great! Just finished a really productive meeting.',
    timestamp: '10:32 AM',
    type: 'text',
    isRead: true
  },
  {
    id: '3',
    senderId: '1',
    content: 'That\'s awesome! Want to grab coffee later?',
    timestamp: '10:35 AM',
    type: 'text',
    isRead: true,
    reactions: [
      { emoji: '❤️', users: ['me'] },
      { emoji: '👍', users: ['me'] }
    ]
  },
  {
    id: '4',
    senderId: 'me',
    content: '',
    timestamp: '10:36 AM',
    type: 'image',
    isRead: true,
    file: {
      name: 'coffee-shop.jpg',
      size: '2.3 MB',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300&h=200&fit=crop'
    }
  },
  {
    id: '5',
    senderId: 'me',
    content: 'How about this place? I heard they have amazing lattes!',
    timestamp: '10:36 AM',
    type: 'text',
    isRead: false
  }
];

const quickReactions = ['❤️', '👍', '😂', '😮', '😢', '⭐'];

export function Chat({ user }: ChatProps) {
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(contacts[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isAudioCall, setIsAudioCall] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setNewMessage('');
      setReplyTo(null);
      // Add message logic here
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    // Add reaction logic here
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  const VideoCallInterface = () => (
    <motion.div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <div className="relative w-full h-full">
        {/* Main video */}
        <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
          <div className="text-center text-white">
            <Avatar className="h-32 w-32 mx-auto mb-4">
              <AvatarImage src={selectedContact?.avatar} />
              <AvatarFallback className="text-2xl">
                {selectedContact?.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-semibold mb-2">{selectedContact?.name}</h2>
            <p className="text-blue-200">Calling...</p>
          </div>
        </div>

        {/* User's video (small) */}
        <div className="absolute top-4 right-4 w-48 h-32 bg-gray-800 rounded-lg overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
          <Button variant="ghost" size="lg" className="bg-white/20 hover:bg-white/30 text-white rounded-full w-14 h-14">
            <MicOff className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="lg" className="bg-white/20 hover:bg-white/30 text-white rounded-full w-14 h-14">
            <VideoOff className="h-6 w-6" />
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={() => setIsVideoCall(false)}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="lg" className="bg-white/20 hover:bg-white/30 text-white rounded-full w-14 h-14">
            <Volume2 className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      <motion.div
        className="max-w-7xl mx-auto h-[calc(100vh-200px)]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Sidebar */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Messages
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 mx-4 mb-4">
                    <TabsTrigger value="chats">Chats</TabsTrigger>
                    <TabsTrigger value="groups">Groups</TabsTrigger>
                  </TabsList>

                  <TabsContent value="chats" className="m-0">
                    <ScrollArea className="h-[calc(100vh-350px)]">
                      <div className="space-y-1 px-4">
                        {filteredContacts.map((contact) => (
                          <motion.div
                            key={contact.id}
                            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedContact?.id === contact.id 
                                ? 'bg-blue-50 border border-blue-200' 
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedContact(contact)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="relative">
                              <Avatar>
                                <AvatarImage src={contact.avatar} />
                                <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                contact.status === 'online' ? 'bg-green-500' :
                                contact.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                              }`} />
                              {contact.isPinned && (
                                <Pin className="absolute -top-1 -left-1 h-3 w-3 text-blue-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium truncate">{contact.name}</p>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-muted-foreground">{contact.lastMessageTime}</span>
                                  {contact.unreadCount > 0 && (
                                    <Badge className="bg-blue-500 text-white text-xs px-2 py-0 min-w-5 h-5 flex items-center justify-center">
                                      {contact.unreadCount}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground truncate">
                                  {contact.isTyping ? (
                                    <span className="flex items-center text-blue-500">
                                      <motion.span
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                      >
                                        Typing...
                                      </motion.span>
                                    </span>
                                  ) : (
                                    contact.lastMessage
                                  )}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="groups" className="m-0">
                    <ScrollArea className="h-[calc(100vh-350px)]">
                      <div className="space-y-1 px-4">
                        {groupChats.map((group) => (
                          <motion.div
                            key={group.id}
                            className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="relative">
                              <Avatar>
                                <AvatarImage src={group.avatar} />
                                <AvatarFallback>{group.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              {group.isActive && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium truncate">{group.name}</p>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-muted-foreground">{group.lastMessageTime}</span>
                                  {group.unreadCount > 0 && (
                                    <Badge className="bg-blue-500 text-white text-xs px-2 py-0">
                                      {group.unreadCount}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground truncate">{group.lastMessage}</p>
                                <div className="flex -space-x-1">
                                  {group.members.slice(0, 3).map((member, index) => (
                                    <Avatar key={member.id} className="w-5 h-5 border border-white">
                                      <AvatarImage src={member.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Chat Area */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            {selectedContact ? (
              <Card className="h-full flex flex-col">
                {/* Chat Header */}
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={selectedContact.avatar} />
                          <AvatarFallback>{selectedContact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          selectedContact.status === 'online' ? 'bg-green-500' :
                          selectedContact.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{selectedContact.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedContact.status === 'online' ? 'Active now' :
                           selectedContact.status === 'away' ? 'Away' :
                           `Last seen ${selectedContact.lastSeen}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAudioCall(true)}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsVideoCall(true)}
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Pin className="h-4 w-4 mr-2" />
                            Pin Chat
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Chat Settings
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-0 overflow-hidden">
                  <ScrollArea className="h-[calc(100vh-400px)] p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className={`max-w-xs lg:max-w-md ${message.senderId === 'me' ? 'order-2' : 'order-1'}`}>
                            {message.replyTo && (
                              <div className="bg-gray-100 rounded-t-lg p-2 border-l-4 border-blue-500 mb-1">
                                <p className="text-xs text-muted-foreground">{message.replyTo.sender}</p>
                                <p className="text-sm truncate">{message.replyTo.content}</p>
                              </div>
                            )}
                            
                            <div className={`relative group ${
                              message.senderId === 'me'
                                ? 'bg-blue-500 text-white rounded-l-lg rounded-tr-lg'
                                : 'bg-gray-100 text-gray-900 rounded-r-lg rounded-tl-lg'
                            } p-3`}>
                              {message.type === 'image' && message.file && (
                                <div className="mb-2">
                                  <img
                                    src={message.file.url}
                                    alt={message.file.name}
                                    className="rounded-lg max-w-full h-auto"
                                  />
                                </div>
                              )}
                              
                              {message.content && (
                                <p className="text-sm">{message.content}</p>
                              )}
                              
                              <div className="flex items-center justify-between mt-1">
                                <span className={`text-xs ${
                                  message.senderId === 'me' ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                  {message.timestamp}
                                </span>
                                {message.senderId === 'me' && (
                                  <div className="flex items-center space-x-1">
                                    {message.isEdited && (
                                      <span className="text-xs text-blue-100">edited</span>
                                    )}
                                    {message.isRead ? (
                                      <CheckCheck className="h-3 w-3 text-blue-100" />
                                    ) : (
                                      <Check className="h-3 w-3 text-blue-100" />
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Quick reactions on hover */}
                              <div className="absolute -bottom-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex bg-white shadow-lg rounded-full p-1 space-x-1">
                                  {quickReactions.slice(0, 3).map((emoji, index) => (
                                    <button
                                      key={index}
                                      className="hover:bg-gray-100 rounded-full p-1 text-sm"
                                      onClick={() => handleReaction(message.id, emoji)}
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {message.reactions && message.reactions.length > 0 && (
                              <div className="flex space-x-1 mt-1">
                                {message.reactions.map((reaction, index) => (
                                  <div
                                    key={index}
                                    className="bg-white shadow border rounded-full px-2 py-1 text-xs flex items-center space-x-1"
                                  >
                                    <span>{reaction.emoji}</span>
                                    <span className="text-muted-foreground">{reaction.users.length}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {message.senderId !== 'me' && (
                            <Avatar className="w-8 h-8 order-1 mr-2">
                              <AvatarImage src={selectedContact.avatar} />
                              <AvatarFallback className="text-xs">
                                {selectedContact.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    <div ref={messagesEndRef} />
                  </ScrollArea>
                </CardContent>

                {/* Reply Banner */}
                <AnimatePresence>
                  {replyTo && (
                    <motion.div
                      className="px-4 py-2 bg-blue-50 border-l-4 border-blue-500"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-blue-600 font-medium">Replying to {replyTo.senderId === 'me' ? 'You' : selectedContact.name}</p>
                          <p className="text-sm text-gray-600 truncate">{replyTo.content}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyTo(null)}
                        >
                          ✕
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Button variant="ghost" size="sm">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Camera className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MapPin className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Gift className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 relative">
                          <Input
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="pr-10"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          >
                            <Smile className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Mic className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground">Choose a chat to start messaging</p>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Video Call Interface */}
      <AnimatePresence>
        {isVideoCall && <VideoCallInterface />}
      </AnimatePresence>
    </>
  );
}