import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Bell, Check, X, Heart, MessageCircle, UserPlus, Calendar, CheckCheck } from 'lucide-react';

interface NotificationsProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

const mockNotifications = [
  {
    id: '1',
    type: 'like',
    title: 'Sarah Johnson liked your post',
    message: 'Your post about the coffee shop',
    timestamp: '5 minutes ago',
    isRead: false,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
    actionable: false
  },
  {
    id: '2',
    type: 'friend_request',
    title: 'Alex Rodriguez sent you a friend request',
    message: '3 mutual friends',
    timestamp: '1 hour ago',
    isRead: false,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    actionable: true
  },
  {
    id: '3',
    type: 'hangout_invite',
    title: 'Mike Chen invited you to Weekend Hiking',
    message: 'This Saturday at Blue Ridge Mountains',
    timestamp: '2 hours ago',
    isRead: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    actionable: true
  },
  {
    id: '4',
    type: 'comment',
    title: 'Emily Davis commented on your post',
    message: '"Great photo! Where was this taken?"',
    timestamp: '3 hours ago',
    isRead: true,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    actionable: false
  },
  {
    id: '5',
    type: 'hangout_reminder',
    title: 'Hangout reminder: Coffee & Code',
    message: 'Tomorrow at 2:00 PM at Downtown Cafe',
    timestamp: '1 day ago',
    isRead: true,
    avatar: null,
    actionable: false
  }
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'like':
      return <Heart className="w-4 h-4 text-red-500" />;
    case 'comment':
      return <MessageCircle className="w-4 h-4 text-blue-500" />;
    case 'friend_request':
      return <UserPlus className="w-4 h-4 text-green-500" />;
    case 'hangout_invite':
    case 'hangout_reminder':
      return <Calendar className="w-4 h-4 text-purple-500" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
};

export function Notifications({ user }: NotificationsProps) {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
  };

  const handleNotificationAction = (notificationId: string, action: 'accept' | 'reject') => {
    // Handle friend requests, hangout invites, etc.
    setNotifications(notifications.filter(notif => notif.id !== notificationId));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const readNotifications = notifications.filter(n => n.isRead);
  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-semibold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge>{unreadCount}</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No notifications yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-accent/50 hover:bg-accent' : 'hover:bg-accent/30'
                  }`}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        {notification.avatar ? (
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={notification.avatar} alt="User" />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                            <Bell className="w-6 h-6 text-primary-foreground" />
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-background rounded-full flex items-center justify-center shadow-md">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {notification.timestamp}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                        
                        {notification.actionable && !notification.isRead && (
                          <div className="flex space-x-2 mt-3">
                            {notification.type === 'friend_request' && (
                              <>
                                <Button 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationAction(notification.id, 'accept');
                                  }}
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Accept
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationAction(notification.id, 'reject');
                                  }}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Decline
                                </Button>
                              </>
                            )}
                            {notification.type === 'hangout_invite' && (
                              <>
                                <Button 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationAction(notification.id, 'accept');
                                  }}
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Join
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationAction(notification.id, 'reject');
                                  }}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Pass
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-3">
          {unreadNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">All caught up!</p>
                <p className="text-sm text-muted-foreground mt-2">No unread notifications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {unreadNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className="cursor-pointer bg-accent/50 hover:bg-accent transition-colors"
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        {notification.avatar ? (
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={notification.avatar} alt="User" />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                            <Bell className="w-6 h-6 text-primary-foreground" />
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-background rounded-full flex items-center justify-center shadow-md">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {notification.timestamp}
                            </p>
                          </div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                        </div>
                        
                        {notification.actionable && (
                          <div className="flex space-x-2 mt-3">
                            {notification.type === 'friend_request' && (
                              <>
                                <Button 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationAction(notification.id, 'accept');
                                  }}
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Accept
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationAction(notification.id, 'reject');
                                  }}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Decline
                                </Button>
                              </>
                            )}
                            {notification.type === 'hangout_invite' && (
                              <>
                                <Button 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationAction(notification.id, 'accept');
                                  }}
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Join
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationAction(notification.id, 'reject');
                                  }}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Pass
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}