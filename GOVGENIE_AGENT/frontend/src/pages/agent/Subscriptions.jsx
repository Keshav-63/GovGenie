import { Check, X, ArrowRight, Crown, TrendingUp, Users, BarChart2, Zap } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Switch } from "../../components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { formatCurrency } from "../../lib/utils";

const SUBSCRIPTION_PLANS = [

]

const PROMOTIONS = [

]

function PricingCard({ plan }) {
  return (
    <Card className={`flex flex-col ${plan.popular ? "border-primary shadow-md" : ""}`}>
      {plan.popular && (
        <div className="rounded-t-lg bg-primary py-1 text-center text-xs font-medium text-primary-foreground">
          MOST POPULAR
        </div>
      )}
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>
          {plan.price === 0 ? "Free plan for all users" : "For professional agents with higher volume"}
        </CardDescription>
        <div className="mt-4">
          <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
          {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2 text-sm">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              {feature.included ? (
                <Check className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <X className="mr-2 h-4 w-4 text-muted-foreground" />
              )}
              <span className={!feature.included ? "text-muted-foreground" : ""}>{feature.name}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant={plan.current ? "outline" : plan.popular ? "default" : "outline"}>
          {plan.current ? "Current Plan" : "Upgrade"}
          {!plan.current && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  )
}

function PromotionCard({ promotion }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{promotion.name}</CardTitle>
          <Badge>{promotion.duration}</Badge>
        </div>
        <CardDescription>{promotion.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {promotion.benefits.map((benefit, index) => (
            <li key={index} className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="font-medium">{formatCurrency(promotion.price)}</div>
        <Button>
          <Zap className="mr-2 h-4 w-4" />
          <span>Activate</span>
        </Button>
      </CardFooter>
    </Card>
  )
}



function Subscriptions() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subscriptions & Promotions</h2>
          <p className="text-muted-foreground">Manage your subscription and promotions to boost your visibility.</p>
          <p className="text-muted-foreground text-2xl">Coming Soon..</p>
        </div>
        <Button variant="outline">
          <Crown className="mr-2 h-4 w-4" />
          <span>View Premium Benefits</span>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
        
        </div>
        <div>
         
        </div>
      </div>

   

      <Tabs defaultValue="plans" className="w-full">
        <TabsList>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <div className="grid gap-6 md:grid-cols-3">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <PricingCard key={plan.id} plan={plan} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="promotions">
          <div className="grid gap-6 md:grid-cols-3">
            {PROMOTIONS.map((promotion) => (
              <PromotionCard key={promotion.id} promotion={promotion} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Subscriptions

