import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal,
  Camera,
  Video,
  MapPin,
  Smile,
  Mic,
  Image as ImageIcon,
  Calendar,
  Users,
  Zap,
  TrendingUp,
  Play,
  Plus,
  Eye,
  ThumbsUp,
  Laugh,
  Angry,
  Frown,
  Star,
  Gift,
  Music,
  BarChart3
} from 'lucide-react';

interface FeedProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface Post {
  id: string;
  user: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  content: string;
  image?: string;
  video?: string;
  location?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  hasLiked: boolean;
  hasBookmarked: boolean;
  type: 'text' | 'image' | 'video' | 'poll' | 'event';
  poll?: {
    question: string;
    options: { text: string; votes: number; percentage: number }[];
    totalVotes: number;
    hasVoted: boolean;
  };
  event?: {
    title: string;
    date: string;
    location: string;
    attendees: number;
    isAttending: boolean;
  };
}

interface Story {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  image: string;
  timestamp: string;
  viewed: boolean;
}

const stories: Story[] = [
  {
    id: '1',
    user: {
      name: 'Your Story',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    image: '',
    timestamp: '',
    viewed: false
  },
  {
    id: '2',
    user: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332f1f8?w=100&h=100&fit=crop&crop=face'
    },
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=300&fit=crop',
    timestamp: '2h ago',
    viewed: false
  },
  {
    id: '3',
    user: {
      name: 'Mike Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&h=300&fit=crop',
    timestamp: '4h ago',
    viewed: true
  },
  {
    id: '4',
    user: {
      name: 'Emma Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    },
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=200&h=300&fit=crop',
    timestamp: '6h ago',
    viewed: false
  }
];

const posts: Post[] = [
  {
    id: '1',
    user: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332f1f8?w=100&h=100&fit=crop&crop=face',
      verified: true
    },
    content: 'Just discovered this amazing coffee shop downtown! The atmosphere is perfect for catching up with friends ☕✨',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&h=400&fit=crop',
    location: 'Downtown Coffee House',
    timestamp: '2 hours ago',
    likes: 45,
    comments: 12,
    shares: 3,
    hasLiked: false,
    hasBookmarked: true,
    type: 'image'
  },
  {
    id: '2',
    user: {
      name: 'Mike Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    content: 'What\'s your favorite way to spend a weekend?',
    timestamp: '4 hours ago',
    likes: 28,
    comments: 15,
    shares: 2,
    hasLiked: true,
    hasBookmarked: false,
    type: 'poll',
    poll: {
      question: 'What\'s your favorite way to spend a weekend?',
      options: [
        { text: 'Outdoor adventures', votes: 45, percentage: 35 },
        { text: 'Staying home and relaxing', votes: 38, percentage: 30 },
        { text: 'Hanging out with friends', votes: 32, percentage: 25 },
        { text: 'Exploring new places', votes: 13, percentage: 10 }
      ],
      totalVotes: 128,
      hasVoted: true
    }
  },
  {
    id: '3',
    user: {
      name: 'Emma Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    },
    content: 'Beach day vibes! 🌊 Who else loves the sound of waves?',
    video: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    location: 'Sunset Beach',
    timestamp: '6 hours ago',
    likes: 67,
    comments: 8,
    shares: 5,
    hasLiked: true,
    hasBookmarked: false,
    type: 'video'
  },
  {
    id: '4',
    user: {
      name: 'Alex Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    content: 'Join me for a photography workshop this Saturday! We\'ll explore the city and capture some amazing shots 📸',
    timestamp: '8 hours ago',
    likes: 23,
    comments: 6,
    shares: 4,
    hasLiked: false,
    hasBookmarked: true,
    type: 'event',
    event: {
      title: 'Photography Workshop',
      date: 'Saturday, 2:00 PM',
      location: 'City Center',
      attendees: 15,
      isAttending: false
    }
  }
];

const reactions = [
  { icon: ThumbsUp, name: 'like', color: 'text-blue-500' },
  { icon: Heart, name: 'love', color: 'text-red-500' },
  { icon: Laugh, name: 'laugh', color: 'text-yellow-500' },
  { icon: Frown, name: 'sad', color: 'text-blue-400' },
  { icon: Angry, name: 'angry', color: 'text-red-600' },
  { icon: Star, name: 'wow', color: 'text-purple-500' }
];

export function Feed({ user }: FeedProps) {
  const [activeTab, setActiveTab] = useState('for-you');
  const [newPost, setNewPost] = useState('');
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [feedPosts, setFeedPosts] = useState(posts);

  const handleLike = (postId: string) => {
    setFeedPosts(feedPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          hasLiked: !post.hasLiked,
          likes: post.hasLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleBookmark = (postId: string) => {
    setFeedPosts(feedPosts.map(post => {
      if (post.id === postId) {
        return { ...post, hasBookmarked: !post.hasBookmarked };
      }
      return post;
    }));
  };

  const handlePollVote = (postId: string, optionIndex: number) => {
    setFeedPosts(feedPosts.map(post => {
      if (post.id === postId && post.poll && !post.poll.hasVoted) {
        const updatedOptions = post.poll.options.map((option, index) => ({
          ...option,
          votes: index === optionIndex ? option.votes + 1 : option.votes
        }));
        const totalVotes = updatedOptions.reduce((sum, option) => sum + option.votes, 0);
        const optionsWithPercentage = updatedOptions.map(option => ({
          ...option,
          percentage: Math.round((option.votes / totalVotes) * 100)
        }));
        
        return {
          ...post,
          poll: {
            ...post.poll,
            options: optionsWithPercentage,
            totalVotes,
            hasVoted: true
          }
        };
      }
      return post;
    }));
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

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Stories Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4 overflow-x-auto pb-2">
              {stories.map((story, index) => (
                <motion.div
                  key={story.id}
                  className="flex-shrink-0 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative">
                    {story.id === '1' ? (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <Plus className="h-6 w-6 text-white" />
                      </div>
                    ) : (
                      <>
                        <div className={`w-16 h-16 rounded-full p-1 ${story.viewed ? 'bg-gray-300' : 'bg-gradient-to-r from-pink-500 to-orange-500'}`}>
                          <Avatar className="w-full h-full">
                            <AvatarImage src={story.user.avatar} />
                            <AvatarFallback>{story.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-center mt-1 max-w-16 truncate">
                    {story.id === '1' ? 'Add Story' : story.user.name.split(' ')[0]}
                  </p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Post */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Avatar>
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="What's on your mind?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[80px] border-0 resize-none focus:ring-0 bg-gray-50 rounded-xl"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="text-blue-500 hover:bg-blue-50">
                      <ImageIcon className="h-4 w-4 mr-1" />
                      Photo
                    </Button>
                    <Button variant="ghost" size="sm" className="text-green-500 hover:bg-green-50">
                      <Video className="h-4 w-4 mr-1" />
                      Video
                    </Button>
                    <Button variant="ghost" size="sm" className="text-purple-500 hover:bg-purple-50">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Poll
                    </Button>
                    <Button variant="ghost" size="sm" className="text-orange-500 hover:bg-orange-50">
                      <Calendar className="h-4 w-4 mr-1" />
                      Event
                    </Button>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-blue-500 to-purple-600"
                    disabled={!newPost.trim()}
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Feed Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="for-you" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              For You
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Following
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6 mt-6">
            {feedPosts.map((post, index) => (
              <motion.div
                key={post.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={post.user.avatar} />
                          <AvatarFallback>{post.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">{post.user.name}</span>
                            {post.user.verified && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-2 py-0">
                                ✓ Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>{post.timestamp}</span>
                            {post.location && (
                              <>
                                <span>•</span>
                                <span className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {post.location}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <p className="mb-4">{post.content}</p>

                    {/* Image Post */}
                    {post.image && (
                      <div className="mb-4">
                        <img
                          src={post.image}
                          alt="Post content"
                          className="w-full rounded-lg object-cover max-h-96"
                        />
                      </div>
                    )}

                    {/* Video Post */}
                    {post.video && (
                      <div className="mb-4 relative">
                        <div className="w-full h-64 bg-black rounded-lg flex items-center justify-center">
                          <Button variant="ghost" size="lg" className="text-white hover:bg-white/20">
                            <Play className="h-8 w-8" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Poll Post */}
                    {post.poll && (
                      <div className="mb-4 space-y-3">
                        <h4 className="font-medium">{post.poll.question}</h4>
                        <div className="space-y-2">
                          {post.poll.options.map((option, index) => (
                            <motion.div
                              key={index}
                              className={`relative p-3 rounded-lg border cursor-pointer transition-colors ${
                                post.poll?.hasVoted 
                                  ? 'bg-gray-50' 
                                  : 'hover:bg-gray-50'
                              }`}
                              onClick={() => !post.poll?.hasVoted && handlePollVote(post.id, index)}
                              whileHover={!post.poll?.hasVoted ? { scale: 1.02 } : {}}
                              whileTap={!post.poll?.hasVoted ? { scale: 0.98 } : {}}
                            >
                              {post.poll?.hasVoted && (
                                <motion.div
                                  className="absolute inset-0 bg-blue-100 rounded-lg"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${option.percentage}%` }}
                                  transition={{ duration: 0.8, ease: "easeOut" }}
                                />
                              )}
                              <div className="relative flex items-center justify-between">
                                <span>{option.text}</span>
                                {post.poll?.hasVoted && (
                                  <span className="text-sm font-medium">
                                    {option.percentage}%
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {post.poll.totalVotes} votes
                        </p>
                      </div>
                    )}

                    {/* Event Post */}
                    {post.event && (
                      <div className="mb-4">
                        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold mb-2">{post.event.title}</h4>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {post.event.date}
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    {post.event.location}
                                  </div>
                                  <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-2" />
                                    {post.event.attendees} attending
                                  </div>
                                </div>
                              </div>
                              <Button 
                                variant={post.event.isAttending ? "default" : "outline"}
                                size="sm"
                              >
                                {post.event.isAttending ? "Going" : "Interested"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-1">
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`${post.hasLiked ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500`}
                            onClick={() => handleLike(post.id)}
                            onMouseEnter={() => setShowReactions(post.id)}
                            onMouseLeave={() => setShowReactions(null)}
                          >
                            <Heart className={`h-4 w-4 mr-1 ${post.hasLiked ? 'fill-current' : ''}`} />
                            {post.likes}
                          </Button>
                          
                          {/* Reaction Picker */}
                          <AnimatePresence>
                            {showReactions === post.id && (
                              <motion.div
                                className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-lg border p-2 flex space-x-1"
                                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                transition={{ duration: 0.2 }}
                              >
                                {reactions.map((reaction, index) => (
                                  <motion.button
                                    key={reaction.name}
                                    className={`p-1 rounded-full hover:bg-gray-100 ${reaction.color}`}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                  >
                                    <reaction.icon className="h-5 w-5" />
                                  </motion.button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-500">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {post.comments}
                        </Button>
                        
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-green-500">
                          <Share className="h-4 w-4 mr-1" />
                          {post.shares}
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`${post.hasBookmarked ? 'text-yellow-500' : 'text-muted-foreground'} hover:text-yellow-500`}
                        onClick={() => handleBookmark(post.id)}
                      >
                        <Bookmark className={`h-4 w-4 ${post.hasBookmarked ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}