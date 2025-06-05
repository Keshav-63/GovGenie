import {
  Star,
  StarHalf,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  User,
  BarChart3,
  ArrowRight,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { formatCurrency, formatNumber } from "../../lib/utils";

const ratingBreakdown = [
  { rating: 5, percentage: 65, count: 137 },
  { rating: 4, percentage: 20, count: 42 },
  { rating: 3, percentage: 10, count: 21 },
  { rating: 2, percentage: 3, count: 6 },
  { rating: 1, percentage: 2, count: 4 },
];

const recentFeedback = [];

function RenderRating({ rating }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className="flex text-amber-500">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={i} className="fill-current h-4 w-4" />
      ))}
      {hasHalfStar && <StarHalf className="fill-current h-4 w-4" />}
      {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
        <Star
          key={i + fullStars + (hasHalfStar ? 1 : 0)}
          className="h-4 w-4 text-muted"
        />
      ))}
    </div>
  );
}

function Ratings() {
  const overallRating = 4.5;
  const totalReviews = 210;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Ratings & Feedback
          </h2>
          <p className="text-muted-foreground">
            Monitor your performance and customer feedback.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Coming Soon</div>
            {/* <p className="text-xs text-muted-foreground">Based on {formatNumber(totalReviews)} reviews</p> */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              User Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Coming Soon</div>

            {/* <div className="flex items-center gap-2 text-green-600">
              <ThumbsUp className="h-4 w-4 fill-current" />
              <span className="text-sm">positive feedback</span>
            </div> */}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Rated Services</CardTitle>
            <CardDescription>
              Your best performing services by rating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4"></div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="feedback" className="w-full">
        <TabsList>
          <TabsTrigger value="feedback">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Recent Feedback</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-4">
          {recentFeedback.map((feedback) => (
            <Card key={feedback.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage
                      src={feedback.customer.image}
                      alt={feedback.customer.name}
                    />
                    <AvatarFallback>
                      {feedback.customer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {feedback.customer.name}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{feedback.service}</span>
                          <span>•</span>
                          <span>
                            {new Date(feedback.date).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                      <RenderRating rating={feedback.rating} />
                    </div>
                    <div className="mt-2 text-sm">{feedback.comment}</div>
                    <div className="mt-3 flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-muted-foreground hover:text-foreground"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>Helpful</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-muted-foreground hover:text-foreground"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Reply</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

       
      </Tabs>
    </div>
  );
}

export default Ratings;
