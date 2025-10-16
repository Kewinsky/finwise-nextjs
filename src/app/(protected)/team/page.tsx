'use client';

import { SiteHeader } from '@/components/layout/site-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Mail, Phone, MapPin, Calendar, Users, UserCheck, UserX } from 'lucide-react';

export default function TeamPage() {
  const teamMembers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Product Manager',
      email: 'sarah.johnson@company.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      status: 'active',
      joinDate: '2023-01-15',
      avatar: '/images/avatars/sarah.jpg',
      projects: 3,
      skills: ['Product Strategy', 'Agile', 'User Research'],
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Senior Developer',
      email: 'michael.chen@company.com',
      phone: '+1 (555) 234-5678',
      location: 'Seattle, WA',
      status: 'active',
      joinDate: '2022-08-20',
      avatar: '/images/avatars/michael.jpg',
      projects: 5,
      skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'UX Designer',
      email: 'emily.rodriguez@company.com',
      phone: '+1 (555) 345-6789',
      location: 'Austin, TX',
      status: 'active',
      joinDate: '2023-03-10',
      avatar: '/images/avatars/emily.jpg',
      projects: 2,
      skills: ['Figma', 'User Testing', 'Prototyping', 'Design Systems'],
    },
    {
      id: 4,
      name: 'David Kim',
      role: 'DevOps Engineer',
      email: 'david.kim@company.com',
      phone: '+1 (555) 456-7890',
      location: 'New York, NY',
      status: 'on-leave',
      joinDate: '2022-11-05',
      avatar: '/images/avatars/david.jpg',
      projects: 4,
      skills: ['Docker', 'Kubernetes', 'CI/CD', 'Monitoring'],
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      role: 'Marketing Manager',
      email: 'lisa.thompson@company.com',
      phone: '+1 (555) 567-8901',
      location: 'Chicago, IL',
      status: 'active',
      joinDate: '2023-06-01',
      avatar: '/images/avatars/lisa.jpg',
      projects: 1,
      skills: ['Digital Marketing', 'Content Strategy', 'Analytics', 'SEO'],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'on-leave':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'on-leave':
        return <UserX className="h-4 w-4 text-yellow-500" />;
      case 'inactive':
        return <UserX className="h-4 w-4 text-gray-500" />;
      default:
        return <UserX className="h-4 w-4 text-gray-500" />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <>
      <SiteHeader title="Team" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            {/* Header with Add Button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Team Members</h2>
                <p className="text-muted-foreground">
                  Manage your team and collaborate effectively
                </p>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teamMembers.length}</div>
                  <p className="text-xs text-muted-foreground">+1 from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {teamMembers.filter((m) => m.status === 'active').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Currently working</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">On Leave</CardTitle>
                  <UserX className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {teamMembers.filter((m) => m.status === 'on-leave').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Temporarily away</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Projects</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(
                      teamMembers.reduce((sum, m) => sum + m.projects, 0) / teamMembers.length,
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Per team member</p>
                </CardContent>
              </Card>
            </div>

            {/* Team Members Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teamMembers.map((member) => (
                <Card key={member.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{member.name}</CardTitle>
                          {getStatusIcon(member.status)}
                        </div>
                        <CardDescription>{member.role}</CardDescription>
                        <Badge className={getStatusColor(member.status)}>
                          {member.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Contact Info */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{member.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{member.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{member.location}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Joined {new Date(member.joinDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{member.projects} projects</span>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {member.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {member.skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{member.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
