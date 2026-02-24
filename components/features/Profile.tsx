import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface ProfileProps {
  user: User;
}

export function Profile({ user }: ProfileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user.name}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">{user.email}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
