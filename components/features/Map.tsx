import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  MapPin, 
  Search, 
  Users, 
  Navigation,
  Star,
  Heart,
  MessageCircle,
  Share,
  Clock,
  Zap,
  Coffee,
  ShoppingBag,
  Utensils,
  Fuel,
  Building,
  Camera,
  Plus,
  Filter,
  Compass,
  Route,
  Car
} from 'lucide-react';

interface MapProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface NearbyUser {
  id: string;
  name: string;
  avatar: string;
  distance: string;
  status: string;
  lastSeen: string;
  isOnline: boolean;
  location: string;
  mutualFriends: number;
}

interface Place {
  id: string;
  name: string;
  type: 'restaurant' | 'cafe' | 'shopping' | 'gas' | 'hotel' | 'attraction';
  rating: number;
  distance: string;
  price: string;
  image: string;
  reviews: number;
  isOpen: boolean;
  description: string;
  tags: string[];
}

interface CheckIn {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  place: string;
  time: string;
  image?: string;
  likes: number;
  comments: number;
}

const nearbyUsers: NearbyUser[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332f1f8?w=100&h=100&fit=crop&crop=face',
    distance: '0.2 km',
    status: 'Having coffee ☕',
    lastSeen: '2 min ago',
    isOnline: true,
    location: 'Central Park Cafe',
    mutualFriends: 12
  },
  {
    id: '2',
    name: 'Mike Johnson',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    distance: '0.5 km',
    status: 'Exploring the city 🗺️',
    lastSeen: '5 min ago',
    isOnline: true,
    location: 'Downtown Plaza',
    mutualFriends: 8
  },
  {
    id: '3',
    name: 'Emma Wilson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    distance: '1.2 km',
    status: 'Shopping time 🛍️',
    lastSeen: '15 min ago',
    isOnline: false,
    location: 'Fashion District',
    mutualFriends: 15
  },
  {
    id: '4',
    name: 'Alex Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    distance: '2.1 km',
    status: 'At the gym 💪',
    lastSeen: '30 min ago',
    isOnline: false,
    location: 'FitZone Gym',
    mutualFriends: 6
  }
];

const places: Place[] = [
  {
    id: '1',
    name: 'Blue Moon Cafe',
    type: 'cafe',
    rating: 4.8,
    distance: '0.1 km',
    price: '$$',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300&h=200&fit=crop',
    reviews: 234,
    isOpen: true,
    description: 'Cozy cafe with artisanal coffee and pastries',
    tags: ['Coffee', 'Wifi', 'Outdoor Seating']
  },
  {
    id: '2',
    name: 'Sakura Sushi',
    type: 'restaurant',
    rating: 4.6,
    distance: '0.3 km',
    price: '$$$',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop',
    reviews: 189,
    isOpen: true,
    description: 'Authentic Japanese cuisine with fresh sushi',
    tags: ['Sushi', 'Japanese', 'Date Night']
  },
  {
    id: '3',
    name: 'Urban Boutique',
    type: 'shopping',
    rating: 4.4,
    distance: '0.7 km',
    price: '$$',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop',
    reviews: 156,
    isOpen: true,
    description: 'Trendy fashion and accessories',
    tags: ['Fashion', 'Trendy', 'Local Brand']
  },
  {
    id: '4',
    name: 'City Art Gallery',
    type: 'attraction',
    rating: 4.9,
    distance: '1.2 km',
    price: '$',
    image: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=300&h=200&fit=crop',
    reviews: 412,
    isOpen: true,
    description: 'Contemporary art exhibitions and installations',
    tags: ['Art', 'Culture', 'Photography']
  }
];

const recentCheckIns: CheckIn[] = [
  {
    id: '1',
    user: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332f1f8?w=50&h=50&fit=crop&crop=face'
    },
    place: 'Blue Moon Cafe',
    time: '5 min ago',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&h=150&fit=crop',
    likes: 12,
    comments: 3
  },
  {
    id: '2',
    user: {
      name: 'Mike Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face'
    },
    place: 'Central Park',
    time: '12 min ago',
    likes: 8,
    comments: 1
  }
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'restaurant': return Utensils;
    case 'cafe': return Coffee;
    case 'shopping': return ShoppingBag;
    case 'gas': return Fuel;
    case 'hotel': return Building;
    case 'attraction': return Camera;
    default: return MapPin;
  }
};

export function Map({ user }: MapProps) {
  const [activeTab, setActiveTab] = useState('nearby');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredPlaces = places.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || place.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

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
              <Compass className="h-8 w-8 text-blue-500" />
            </motion.div>
            Explore Nearby
          </h1>
          <p className="text-muted-foreground">Discover places and connect with friends around you</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            Share Location
          </Button>
          <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600">
            <Plus className="h-4 w-4" />
            Check In
          </Button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search places, restaurants, attractions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="all">All Places</option>
                  <option value="restaurant">Restaurants</option>
                  <option value="cafe">Cafes</option>
                  <option value="shopping">Shopping</option>
                  <option value="attraction">Attractions</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="nearby">Nearby Users</TabsTrigger>
            <TabsTrigger value="places">Places</TabsTrigger>
            <TabsTrigger value="checkins">Check-ins</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
          </TabsList>

          <TabsContent value="nearby" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nearbyUsers.map((nearbyUser, index) => (
                <motion.div
                  key={nearbyUser.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={nearbyUser.avatar} />
                            <AvatarFallback>{nearbyUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          {nearbyUser.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold truncate">{nearbyUser.name}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {nearbyUser.distance}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{nearbyUser.status}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {nearbyUser.location}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {nearbyUser.mutualFriends} mutual friends • {nearbyUser.lastSeen}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <Button variant="outline" size="sm" className="flex-1 mr-2">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button size="sm" className="flex-1">
                          <Users className="h-4 w-4 mr-1" />
                          Add Friend
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="places" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlaces.map((place, index) => {
                const IconComponent = getTypeIcon(place.type);
                return (
                  <motion.div
                    key={place.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <Card className="overflow-hidden">
                      <div className="relative h-48">
                        <img
                          src={place.image}
                          alt={place.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className={place.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                            {place.isOpen ? 'Open' : 'Closed'}
                          </Badge>
                        </div>
                        <div className="absolute bottom-2 left-2">
                          <Badge variant="secondary" className="bg-black/50 text-white">
                            <IconComponent className="h-3 w-3 mr-1" />
                            {place.distance}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{place.name}</h3>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{place.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{place.description}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {place.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{place.price}</span>
                            <span>•</span>
                            <span>{place.reviews} reviews</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Heart className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Share className="h-4 w-4" />
                            </Button>
                            <Button size="sm">
                              <Route className="h-4 w-4 mr-1" />
                              Directions
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="checkins" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentCheckIns.map((checkIn, index) => (
                <motion.div
                  key={checkIn.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={checkIn.user.avatar} />
                          <AvatarFallback>{checkIn.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{checkIn.user.name}</span>
                            <span className="text-sm text-muted-foreground">checked in at</span>
                            <span className="font-medium text-blue-600">{checkIn.place}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{checkIn.time}</p>
                          {checkIn.image && (
                            <div className="mb-3">
                              <img
                                src={checkIn.image}
                                alt="Check-in"
                                className="w-full h-32 object-cover rounded-lg"
                              />
                            </div>
                          )}
                          <div className="flex items-center gap-4">
                            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500 transition-colors">
                              <Heart className="h-4 w-4" />
                              {checkIn.likes}
                            </button>
                            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-blue-500 transition-colors">
                              <MessageCircle className="h-4 w-4" />
                              {checkIn.comments}
                            </button>
                            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-green-500 transition-colors">
                              <Share className="h-4 w-4" />
                              Share
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10" />
                  <div className="absolute inset-4 bg-white/20 rounded-lg backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-16 w-16 mx-auto mb-4 text-blue-600" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Interactive Map</h3>
                      <p className="text-gray-600 mb-4">Explore your surroundings and discover new places</p>
                      <div className="flex justify-center gap-2">
                        <Button variant="outline">
                          <Car className="h-4 w-4 mr-2" />
                          Driving
                        </Button>
                        <Button variant="outline">
                          <Users className="h-4 w-4 mr-2" />
                          Walking
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mock location pins */}
                  {places.slice(0, 4).map((place, index) => (
                    <motion.div
                      key={place.id}
                      className="absolute w-8 h-8 bg-red-500 rounded-full cursor-pointer shadow-lg flex items-center justify-center text-white"
                      style={{
                        top: `${20 + index * 15}%`,
                        left: `${15 + index * 20}%`,
                      }}
                      whileHover={{ scale: 1.5, zIndex: 10 }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <MapPin className="h-5 w-5" />
                    </motion.div>
                  ))}
                  
                  {/* Current location */}
                  <motion.div
                    className="absolute w-6 h-6 bg-blue-500 rounded-full shadow-lg"
                    style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                    animate={{
                      scale: [1, 1.2, 1],
                      boxShadow: [
                        '0 0 0 0 rgba(59, 130, 246, 0.7)',
                        '0 0 0 10px rgba(59, 130, 246, 0)',
                        '0 0 0 0 rgba(59, 130, 246, 0)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{nearbyUsers.length}</p>
              <p className="text-sm text-muted-foreground">Nearby Friends</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{places.length}</p>
              <p className="text-sm text-muted-foreground">Places Found</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Camera className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">{recentCheckIns.length}</p>
              <p className="text-sm text-muted-foreground">Recent Check-ins</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <p className="text-2xl font-bold">2.1km</p>
              <p className="text-sm text-muted-foreground">Area Covered</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}