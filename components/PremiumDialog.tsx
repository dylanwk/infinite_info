import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Check, Crown, Lock, X } from "lucide-react";
import { Separator } from "./ui/separator";
import { Card, CardContent } from "./ui/card";

interface PremiumDialogProps {
  open: boolean;
  onClose: () => void;
}

const PremiumDialog: React.FC<PremiumDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[450px] border-hidden [&>button]:hidden p-0 mx-auto overflow-hidden rounded-xl">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-primary/90 to-primary p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6" />
              <DialogTitle className="text-xl font-bold text-white">InfoPlus Premium</DialogTitle>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
          <DialogDescription className="text-white/90 mt-2">
            Unlock advanced features for professional flight tracking
          </DialogDescription>
        </div>

        <div className="p-6">
          {/* Feature cards */}
          <div className="space-y-3 mb-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-full text-primary">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">Enhanced Flight Plans</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Access detailed waypoints, flight progress tracking, and route analysis
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-full text-primary">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">Advanced Analytics</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Visualize flight data with interactive charts and performance metrics
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Benefits list */}
          <div className="space-y-2 mb-6">
            <h3 className="text-sm font-medium">InfoPlus also includes:</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Real-time flight status notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Historical flight data access</span>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Pricing */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-lg font-bold">
                $1.99
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </p>
              <p className="text-xs text-muted-foreground">Cancel anytime</p>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              14-day free trial
            </Badge>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <Button className="w-full" size="lg">
              <Crown className="mr-2 h-4 w-4" /> Subscribe Now
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" className="w-full" size="sm">
                Maybe Later
              </Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumDialog;
