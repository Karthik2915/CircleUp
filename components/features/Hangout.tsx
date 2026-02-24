import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
  DialogTrigger 
} from '../ui/dialog';
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Search,
  Filter,
  Clock,
  Star,
  Heart,
  Coffee,
  Camera,
  Music,
  Gamepad2,
  BookOpen,
  Dumbbell,
  Palette,
  Utensils,
  TreePine,
  Plane,
  ShoppingBag,
  Film,
  Headphones,
  Bike,
  Car,
  Home,
  Shield,
  MessageCircle,
  UserPlus,
  Eye,
  ChevronRight,
  Sparkles,
  Target,
  Zap,
  Globe,
  Navigation
} from 'lucide-react';

interface HangoutsProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface Interest {
  id: string;
  name: string;
  icon: any;
  color: string;
  category: 'activity' | 'hobby' | 'entertainment' | 'fitness' | 'food' | 'travel';
}

interface ActivityPartner {
  id: string;
  name: string;
  avatar: string;
  age: number;
  interests: string[];
  location: string;
  distance: string;
  rating: number;
  commonInterests: number;
  isOnline: boolean;
  lastActive: string;
  bio: string;
  verification: 'verified' | 'photo' | 'none';
  mutualFriends: number;
}

interface HangoutSuggestion {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  duration: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  cost: '$' | '$$' | '$$$';
  groupSize: string;
  location: string;
  rating: number;
  reviews: number;
  tags: string[];
}

interface PendingHangout {
  id: string;
  partner: ActivityPartner;
  activity: string;
  date: string;
  time: string;
  location: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  chatId?: string;
}

const interests: Interest[] = [
  { id: '1', name: 'Coffee & Cafes', icon: Coffee, color: 'bg-amber-100 text-amber-700', category: 'food' },
  { id: '2', name: 'Photography', icon: Camera, color: 'bg-purple-100 text-purple-700', category: 'hobby' },
  { id: '3', name: 'Live Music', icon: Music, color: 'bg-pink-100 text-pink-700', category: 'entertainment' },
  { id: '4', name: 'Gaming', icon: Gamepad2, color: 'bg-blue-100 text-blue-700', category: 'entertainment' },
  { id: '5', name: 'Reading', icon: BookOpen, color: 'bg-green-100 text-green-700', category: 'hobby' },
  { id: '6', name: 'Fitness', icon: Dumbbell, color: 'bg-red-100 text-red-700', category: 'fitness' },
  { id: '7', name: 'Art & Museums', icon: Palette, color: 'bg-indigo-100 text-indigo-700', category: 'hobby' },
  { id: '8', name: 'Food & Dining', icon: Utensils, color: 'bg-orange-100 text-orange-700', category: 'food' },
  { id: '9', name: 'Hiking', icon: TreePine, color: 'bg-emerald-100 text-emerald-700', category: 'activity' },
  { id: '10', name: 'Travel', icon: Plane, color: 'bg-sky-100 text-sky-700', category: 'travel' },
  { id: '11', name: 'Shopping', icon: ShoppingBag, color: 'bg-rose-100 text-rose-700', category: 'activity' },
  { id: '12', name: 'Movies', icon: Film, color: 'bg-violet-100 text-violet-700', category: 'entertainment' },
];

const activityPartners: ActivityPartner[] = [
  {
    id: '1',
    name: 'Emma Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332f1f8?w=100&h=100&fit=crop&crop=face',
    age: 26,
    interests: ['Photography', 'Coffee & Cafes', 'Art & Museums'],
    location: 'Downtown',
    distance: '1.2 km',
    rating: 4.9,
    commonInterests: 3,
    isOnline: true,
    lastActive: 'Active now',
    bio: 'Love exploring the city through my camera lens. Always up for discovering new coffee spots and art galleries!',
    verification: 'verified',
    mutualFriends: 5
  },
  {
    id: '2',
    name: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    age: 28,
    interests: ['Hiking', 'Photography', 'Travel'],
    location: 'Riverside',
    distance: '2.1 km',
    rating: 4.7,
    commonInterests: 2,
    isOnline: false,
    lastActive: '2h ago',
    bio: 'Weekend warrior seeking adventure buddies. Let\'s explore the great outdoors together!',
    verification: 'photo',
    mutualFriends: 8
  },
  {
    id: '3',
    name: 'Sophie Martinez',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    age: 24,
    interests: ['Live Music', 'Food & Dining', 'Dancing'],
    location: 'Arts District',
    distance: '1.8 km',
    rating: 4.8,
    commonInterests: 2,
    isOnline: true,
    lastActive: 'Active now',
    bio: 'Foodie and music lover! Always looking for the next great concert or restaurant to try.',
    verification: 'verified',
    mutualFriends: 12
  },
  {
    id: '4',
    name: 'Jordan Kim',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    age: 30,
    interests: ['Gaming', 'Movies', 'Coffee & Cafes'],
    location: 'Tech Quarter',
    distance: '3.2 km',
    rating: 4.6,
    commonInterests: 1,
    isOnline: false,
    lastActive: '1d ago',
    bio: 'Casual gamer and movie buff. Let\'s grab coffee and discuss the latest releases!',
    verification: 'photo',
    mutualFriends: 3
  }
];

const hangoutSuggestions: HangoutSuggestion[] = [
  {
    id: '1',
    title: 'Photography Walk in Old Town',
    category: 'Photography',
    description: 'Explore historic architecture and street art while practicing photography techniques',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=200&fit=crop',
    duration: '2-3 hours',
    difficulty: 'easy',
    cost: '$',
    groupSize: '2-4 people',
    location: 'Old Town District',
    rating: 4.8,
    reviews: 156,
    tags: ['Beginner Friendly', 'Historic', 'Creative']
  },
  {
    id: '2',
    title: 'Coffee Cupping Experience',
    category: 'Coffee & Cafes',
    description: 'Learn about different coffee origins and brewing methods with a professional barista',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300&h=200&fit=crop',
    duration: '1.5 hours',
    difficulty: 'easy',
    cost: '$$',
    groupSize: '2-6 people',
    location: 'Artisan Coffee Roasters',
    rating: 4.9,
    reviews: 89,
    tags: ['Educational', 'Tastings', 'Cozy']
  },
  {
    id: '3',
    title: 'Sunset Hiking Trail',
    category: 'Hiking',
    description: 'Moderate hike with beautiful city views, perfect for golden hour photography',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=300&h=200&fit=crop',
    duration: '3-4 hours',
    difficulty: 'moderate',
    cost: '$',
    groupSize: '2-8 people',
    location: 'Eagle Peak Trail',
    rating: 4.7,
    reviews: 234,
    tags: ['Scenic Views', 'Moderate Fitness', 'Golden Hour']
  },
  {
    id: '4',
    title: 'Local Food Market Tour',
    category: 'Food & Dining',
    description: 'Discover local vendors, taste artisanal foods, and learn about regional cuisine',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=300&h=200&fit=crop',
    duration: '2.5 hours',
    difficulty: 'easy',
    cost: '$$',
    groupSize: '2-5 people',
    location: 'Central Market',
    rating: 4.6,
    reviews: 178,
    tags: ['Food Tastings', 'Cultural', 'Walking']
  }
];

const pendingHangouts: PendingHangout[] = [
  {
    id: '1',
    partner: activityPartners[0],
    activity: 'Photography Walk in Old Town',
    date: 'Tomorrow',
    time: '4:00 PM',
    location: 'Old Town District',
    status: 'confirmed',
    chatId: 'chat_1'
  },
  {
    id: '2',
    partner: activityPartners[1],
    activity: 'Sunset Hiking Trail',
    date: 'This Saturday',
    time: '6:00 PM',
    location: 'Eagle Peak Trail',
    status: 'pending'
  }
];

export function Hangouts({ user }: HangoutsProps) {
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Photography', 'Coffee & Cafes']);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<ActivityPartner | null>(null);
  const [showCreateHangout, setShowCreateHangout] = useState(false);

  const handleInterestToggle = (interestName: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestName) 
        ? prev.filter(i => i !== interestName)
        : [...prev, interestName]
    );
  };

  const filteredPartners = activityPartners.filter(partner => 
    partner.interests.some(interest => selectedInterests.includes(interest)) &&
    partner.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSuggestions = hangoutSuggestions.filter(suggestion =>
    selectedInterests.includes(suggestion.category) ||
    suggestion.tags.some(tag => selectedInterests.some(interest => 
      interest.toLowerCase().includes(tag.toLowerCase())
    ))
  );

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
      className="max-w-7xl mx-auto space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Users className="h-8 w-8 text-purple-500" />
            </motion.div>
            Activity Partners
          </h1>
          <p className="text-muted-foreground">Find people who share your interests and plan amazing hangouts together</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Safety Tips
          </Button>
          <Dialog open={showCreateHangout} onOpenChange={setShowCreateHangout}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600">
                <Plus className="h-4 w-4" />
                Create Hangout
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Hangout</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="What activity do you want to do?" />
                <Textarea placeholder="Tell people what you're planning and what to expect..." />
                <div className="grid grid-cols-2 gap-4">
                  <Input type="date" />
                  <Input type="time" />
                </div>
                <Input placeholder="Location" />
                <Button className="w-full">Create Hangout</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Interest Selection */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Your Interests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <motion.button
                  key={interest.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all ${
                    selectedInterests.includes(interest.name)
                      ? `${interest.color} border-2 border-current`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => handleInterestToggle(interest.name)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <interest.icon className="h-4 w-4" />
                  {interest.name}
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Activities
            </TabsTrigger>
            <TabsTrigger value="hangouts" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              My Hangouts
            </TabsTrigger>
            <TabsTrigger value="nearby" className="flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Nearby
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6 mt-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activity partners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Activity Partners Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPartners.map((partner, index) => (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card className="overflow-hidden cursor-pointer" onClick={() => setSelectedPartner(partner)}>
                    <CardContent className="p-0">
                      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                            <AvatarImage src={partner.avatar} />
                            <AvatarFallback>{partner.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                        </div>
                        {partner.isOnline && (
                          <div className="absolute top-4 right-4">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                        )}
                        <div className="absolute top-4 left-4 flex items-center gap-1">
                          {partner.verification === 'verified' && (
                            <Badge className="bg-blue-500 text-white text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {partner.mutualFriends > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {partner.mutualFriends} mutual
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{partner.name}, {partner.age}</h3>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{partner.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <MapPin className="h-3 w-3" />
                          <span>{partner.location} • {partner.distance}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{partner.bio}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {partner.interests.slice(0, 3).map((interest, idx) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className={`text-xs ${selectedInterests.includes(interest) ? 'bg-purple-100 text-purple-700 border-purple-300' : ''}`}
                            >
                              {interest}
                            </Badge>
                          ))}
                          {partner.interests.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{partner.interests.length - 3}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{partner.lastActive}</span>
                          <Badge className="bg-green-100 text-green-700">
                            {partner.commonInterests} common
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSuggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card className="overflow-hidden">
                    <div className="relative h-48">
                      <img
                        src={suggestion.image}
                        alt={suggestion.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-black/50 text-white">
                          {suggestion.cost}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <Badge className={`${
                          suggestion.difficulty === 'easy' ? 'bg-green-500' :
                          suggestion.difficulty === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                        } text-white`}>
                          {suggestion.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{suggestion.title}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{suggestion.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {suggestion.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {suggestion.groupSize}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {suggestion.location}
                        </div>
                        <div className="text-muted-foreground">
                          {suggestion.reviews} reviews
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {suggestion.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button className="w-full">
                        Plan This Activity
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hangouts" className="space-y-6 mt-6">
            <div className="space-y-4">
              {pendingHangouts.map((hangout, index) => (
                <motion.div
                  key={hangout.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={hangout.partner.avatar} />
                          <AvatarFallback>{hangout.partner.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold">{hangout.activity}</h3>
                            <Badge className={
                              hangout.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              hangout.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              hangout.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }>
                              {hangout.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            with {hangout.partner.name}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {hangout.date}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {hangout.time}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {hangout.location}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {hangout.chatId && (
                            <Button variant="outline" size="sm">
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="nearby" className="space-y-6 mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Nearby Activity Partners</h3>
                  <p className="text-muted-foreground mb-4">
                    Enable location to see people near you who share your interests
                  </p>
                  <Button>
                    <Navigation className="h-4 w-4 mr-2" />
                    Enable Location
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Partner Profile Modal */}
      <AnimatePresence>
        {selectedPartner && (
          <Dialog open={!!selectedPartner} onOpenChange={() => setSelectedPartner(null)}>
            <DialogContent className="max-w-md">
              <div className="space-y-4">
                <div className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={selectedPartner.avatar} />
                    <AvatarFallback>{selectedPartner.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold">{selectedPartner.name}, {selectedPartner.age}</h2>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mt-2">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedPartner.location} • {selectedPartner.distance}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{selectedPartner.rating}</span>
                    <span className="text-muted-foreground">({selectedPartner.mutualFriends} mutual friends)</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-sm text-muted-foreground">{selectedPartner.bio}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPartner.interests.map((interest, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline"
                        className={selectedInterests.includes(interest) ? 'bg-purple-100 text-purple-700 border-purple-300' : ''}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </Button>
                  <Button className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600">
                    <UserPlus className="h-4 w-4" />
                    Invite to Hangout
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
}