import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { X, Settings2 } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type IconSize = 0.2 | 0.3 | 0.9;

interface SettingsDialogProps {
  open: boolean;
  handleClose: () => void;
  iconSize: IconSize;
  onIconSizeChange: (value: IconSize) => void;
  projection: "globe" | "mercator";
  onProjectionChange?: () => void;
  isPremium?: boolean;
  showTrack: boolean;
  onFPLChange: () => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  handleClose,
  iconSize,
  onIconSizeChange,
  projection = "globe",
  onProjectionChange,
  showTrack: showFPL,
  onFPLChange,
}) => {
    
  const handleIconSizeChange = (value: string) => {
    if (value) {
      const newSize = parseFloat(value) as IconSize;
      if (newSize !== iconSize) onIconSizeChange(newSize);
    }
  };

  const isGlobeView = projection === "globe";

  const handleProjChange = (checked: boolean) => {
    if (onProjectionChange) {
      // Only trigger change if state actually changes
      if (
        (checked && projection !== "globe") ||
        (!checked && projection !== "mercator")
      ) {
        onProjectionChange();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-white max-w-md [&>button]:hidden p-0 rounded-xl overflow-auto shadow-lg">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings2 className="h-5 w-5" />
              <DialogTitle className="text-xl font-medium">
                Settings
              </DialogTitle>
            </div>
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={handleClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-6">
          {/* Map Projection */}
          <div>
            <h3 className="text-xs text-slate-500 tracking-wide font-medium mb-2 uppercase">
              General
            </h3>
            <div className="bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">Globe View</div>
                <Switch
                  checked={isGlobeView}
                  onCheckedChange={handleProjChange}
                />
              </div>
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">Show Track</div>
                <Switch checked={showFPL} onCheckedChange={onFPLChange} />
              </div>
            </div>
          </div>

          {/* Aircraft Icon Size */}
          <div>
            <h3 className="text-xs text-slate-500 tracking-wide font-medium mb-2 uppercase">
              Aircraft Sizing
            </h3>
            <ToggleGroup
              type="single"
              value={iconSize.toString()}
              onValueChange={handleIconSizeChange}
              className="w-full bg-slate-50 rounded-md grid grid-cols-3 p-1"
            >
              <ToggleGroupItem
                value="0.2"
                className="rounded-sm data-[state=on]:bg-white data-[state=on]:shadow-sm "
              >
                Small
              </ToggleGroupItem>
              <ToggleGroupItem
                value="0.3"
                className="rounded-sm data-[state=on]:bg-white data-[state=on]:shadow-sm "
              >
                Medium
              </ToggleGroupItem>
              <ToggleGroupItem
                value="0.9"
                className="rounded-sm data-[state=on]:bg-white data-[state=on]:shadow-sm "
              >
                Large
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;