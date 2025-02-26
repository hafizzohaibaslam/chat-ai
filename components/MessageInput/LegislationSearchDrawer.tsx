"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { FileSearch2Icon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import MultiSelectComponent from "@/components/MessageInput/MultiSelect";
import { useChatContext } from "@/context/chatContext";

export function LegislationSearchDrawer() {
  const {
    legislation,
    jurisdictions,
    selectedJurisdiction,
    setSelectedJurisdiction,
    selectedLegislation,
    setSelectedLegislation,
  } = useChatContext();

  console.log("selectedJurisdictions", selectedJurisdiction);
  console.log("selectedLegislation", selectedLegislation);

  // Function to toggle jurisdiction selection
  const handleJurisdictionChange = (
    jurisdictionId: number,
    checked: boolean
  ) => {
    setSelectedJurisdiction((prev: number[]) => {
      if (checked) {
        return [...prev, jurisdictionId]; // Add if checked
      } else {
        return prev.filter((id) => id !== jurisdictionId); // Remove if unchecked
      }
    });
  };

  return (
    <TooltipProvider>
      <Sheet>
        <Tooltip>
          <SheetTrigger asChild>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-md rounded-bl-lg h-fit p-[7px] 
                  dark:border-zinc-700 hover:dark:bg-zinc-900 hover:bg-zinc-200"
              >
                <FileSearch2Icon className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
          </SheetTrigger>
          <TooltipContent side="top" sideOffset={8}>
            <p>Legislation Search</p>
          </TooltipContent>
        </Tooltip>

        <SheetContent
          side="bottom"
          className="
            w-full sm:w-1/2 2xl:w-1/3 mx-auto 
            h-1/2 2xl:h-1/3 max-h-[90vh] overflow-y-auto bg-white
            rounded-md p-4 gap-4
            shadow-[0_0_4px_-1px_rgba(0,0,0,0.06),0_0_5px_-1px_rgba(0,0,0,0.1)]
          "
        >
          <SheetHeader>
            <SheetTitle>Legislation Search</SheetTitle>
            <SheetDescription>
              Select your jurisdiction, legislation, etc.
            </SheetDescription>
          </SheetHeader>

          <div className="p-4 space-y-6">
            {/* Select Jurisdiction (Hidden if legislation is selected) */}
            {!selectedLegislation.length && (
              <div>
                <Label className="text-sm font-medium">
                  Select Jurisdiction
                </Label>
                <div className="flex items-center space-x-4 mt-2">
                  {jurisdictions?.jurisdictions?.map(
                    (jurisdiction: { id: number; name: string }) => {
                      return (
                        <div
                          key={jurisdiction.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`jurisdiction-${jurisdiction.id}`}
                            checked={selectedJurisdiction.includes(
                              jurisdiction.id
                            )}
                            onCheckedChange={(checked: boolean) =>
                              handleJurisdictionChange(jurisdiction.id, checked)
                            }
                          />
                          <Label htmlFor={`jurisdiction-${jurisdiction.id}`}>
                            {jurisdiction.name}
                          </Label>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* Multi-select for Legislation */}
            <div>
              <Label className="text-sm font-medium">Select Legislation</Label>
              <div className="mt-2">
                {/* Pass the fetched data to MultiSelectComponent */}
                <MultiSelectComponent
                  data={legislation.sources}
                  setSelectedLegislation={setSelectedLegislation}
                  selectedLegislation={selectedLegislation}
                />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}
