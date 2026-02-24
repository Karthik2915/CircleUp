import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Search, UserPlus, Check, X, MessageCircle } from 'lucide-react';

interface FriendsProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

const mockFriends = [
  {
    id: '2',
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
    status: 'online',
    mutualFriends: 8
  },
  {
    id: '3',
    name: 'Mike Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    status: 'offline',
    mutualFriends: 5
  },
  {
    id: '4',
    name: 'Emily Davis',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    status: 'online',
    mutualFriends: 12
  }
];

const mockFriendRequests = [
  {
    id: '5',
    name: 'Alex Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    mutualFriends: 3,
    requestDate: '2 days ago'
  },
  {
    id: '6',
    name: 'Jessica Kim',
    avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face',
    mutualFriends: 7,
    requestDate: '1 week ago'
  }
];

const mockSuggestions = [
  {
    id: '7',
    name: 'David Wilson',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    mutualFriends: 15,
    reason: 'Works at TechCorp'
  },
  {
    id: '8',
    name: 'Lisa Thompson',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    mutualFriends: 4,
    reason: 'Mutual friends with Sarah Johnson'
  }
];

export function Friends({ user }: FriendsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [friends, setFriends] = useState(mockFriends);
  const [friendRequests, setFriendRequests] = useState(mockFriendRequests);
  const [suggestions, setSuggestions] = useState(mockSuggestions);

  const handleAcceptRequest = (requestId: string) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (request) {
      setFriends([...friends, { ...request, status: 'offline' }]);
      setFriendRequests(friendRequests.filter(r => r.id !== requestId));
    }
  };

  const handleRejectRequest = (requestId: string) => {
    setFriendRequests(friendRequests.filter(r => r.id !== requestId));
  };

  const handleSendRequest = (suggestionId: string) => {
    setSuggestions(suggestions.filter(s => s.id !== suggestionId));
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">Friends</h1>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search friends..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="friends" className="space-y-6">
        <TabsList>
          <TabsTrigger value="friends">
            Friends ({friends.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests ({friendRequests.length})
          </TabsTrigger>
          <TabsTrigger value="suggestions">
            Suggestions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredFriends.map((friend) => (
              <Card key={friend.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={friend.avatar} alt={friend.name} />
                        <AvatarFallback>
                          {friend.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                          friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{friend.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {friend.mutualFriends} mutual friends
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {friendRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No pending friend requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {friendRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={request.avatar} alt={request.name} />
                          <AvatarFallback>
                            {request.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{request.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.mutualFriends} mutual friends • {request.requestDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(request.id)}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar>
                      <AvatarImage src={suggestion.avatar} alt={suggestion.name} />
                      <AvatarFallback>
                        {suggestion.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{suggestion.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {suggestion.mutualFriends} mutual friends
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.reason}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleSendRequest(suggestion.id)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Friend
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}