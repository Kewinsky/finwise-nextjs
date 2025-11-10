import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, User, Search, ArrowRight } from 'lucide-react';
import { appConfig } from '@/config/app';

export const metadata: Metadata = {
  title: `Blog | ${appConfig.app.name}`,
  description: `Stay updated with the latest insights, tutorials, and news from the ${appConfig.app.name} team.`,
};

const blogPosts = [
  {
    id: 1,
    title: 'The Complete Guide to AI-Powered Financial Tracking',
    excerpt:
      'Discover how artificial intelligence is revolutionizing personal finance management and helping users make smarter financial decisions.',
    author: 'Sarah Johnson',
    date: '2024-01-15',
    readTime: '8 min read',
    category: 'AI & Technology',
    image: '/api/placeholder/400/250',
    featured: true,
  },
  {
    id: 2,
    title: 'Bank-Level Security for Your Financial Data',
    excerpt:
      'Understanding the security measures that protect your financial information and ensure your privacy in fintech applications.',
    author: 'Michael Chen',
    date: '2024-01-12',
    readTime: '6 min read',
    category: 'Security',
    image: '/api/placeholder/400/250',
    featured: false,
  },
  {
    id: 3,
    title: 'Designing Intuitive Financial Dashboards',
    excerpt:
      'How we create user-friendly interfaces that make complex financial data accessible and actionable for everyone.',
    author: 'Emily Rodriguez',
    date: '2024-01-10',
    readTime: '5 min read',
    category: 'Design',
    image: '/api/placeholder/400/250',
    featured: false,
  },
  {
    id: 4,
    title: 'Smart Categorization: How AI Learns Your Spending Habits',
    excerpt:
      'Learn how machine learning algorithms automatically categorize your transactions and provide personalized insights.',
    author: 'David Kim',
    date: '2024-01-08',
    readTime: '10 min read',
    category: 'AI & Technology',
    image: '/api/placeholder/400/250',
    featured: false,
  },
  {
    id: 5,
    title: 'Building Healthy Financial Habits in 2024',
    excerpt:
      'Practical tips and strategies for developing better money management habits and achieving your financial goals.',
    author: 'Sarah Johnson',
    date: '2024-01-05',
    readTime: '7 min read',
    category: 'Personal Finance',
    image: '/api/placeholder/400/250',
    featured: false,
  },
  {
    id: 6,
    title: 'The Future of Personal Finance: Trends to Watch',
    excerpt:
      'Exploring emerging trends in fintech and how they will shape the future of personal financial management.',
    author: 'Michael Chen',
    date: '2024-01-03',
    readTime: '9 min read',
    category: 'Industry Trends',
    image: '/api/placeholder/400/250',
    featured: false,
  },
];

const categories = [
  'All',
  'AI & Technology',
  'Personal Finance',
  'Security',
  'Design',
  'Industry Trends',
];

export default function BlogPage() {
  const featuredPost = blogPosts.find((post) => post.featured);
  const regularPosts = blogPosts.filter((post) => !post.featured);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Latest{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Insights & Updates
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay informed with the latest trends, tutorials, and best practices in SaaS development
            and business.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Search articles..." className="pl-10" />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={category === 'All' ? 'default' : 'outline'}
                className={`cursor-pointer ${
                  category === 'All'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0'
                    : 'hover:border-blue-600 dark:hover:border-purple-500'
                }`}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Featured Article</h2>
            <Card className="overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="aspect-video lg:aspect-auto bg-muted flex items-center justify-center">
                  <div className="text-muted-foreground">Featured Image</div>
                </div>
                <CardContent className="p-8">
                  <Badge variant="secondary" className="mb-4">
                    {featuredPost.category}
                  </Badge>
                  <CardTitle className="text-2xl mb-4">{featuredPost.title}</CardTitle>
                  <CardDescription className="text-base mb-6">
                    {featuredPost.excerpt}
                  </CardDescription>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {featuredPost.author}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(featuredPost.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {featuredPost.readTime}
                    </div>
                  </div>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    Read Article
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </div>
            </Card>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <div className="text-muted-foreground">Post Image</div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline">{post.category}</Badge>
                    <span className="text-sm text-muted-foreground">{post.readTime}</span>
                  </div>
                  <CardTitle className="text-lg mb-3 line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="mb-4 line-clamp-3">{post.excerpt}</CardDescription>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Get the latest articles, tutorials, and updates delivered straight to your inbox. No
            spam, unsubscribe at any time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input placeholder="Enter your email" type="email" className="flex-1" />
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
