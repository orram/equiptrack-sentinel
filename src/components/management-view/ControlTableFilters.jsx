import React from 'react';
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function ControlTableFilters({ allPlatoons, selectedPlatoons, onSelectionChange, lang }) {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[250px] justify-between"
                >
                    {selectedPlatoons.length > 0
                        ? `${selectedPlatoons.length} ${lang === 'he' ? 'פלוגות נבחרו' : 'platoon(s) selected'}`
                        : `${lang === 'he' ? 'בחר פלוגות...' : 'Select platoons...'}`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
                <Command>
                    <CommandInput placeholder={lang === 'he' ? 'חפש פלוגה...' : "Search platoon..."} />
                    <CommandList>
                        <CommandEmpty>{lang === 'he' ? 'לא נמצאו פלוגות.' : 'No platoons found.'}</CommandEmpty>
                        <CommandGroup>
                            {allPlatoons.map((platoon) => (
                                <CommandItem
                                    key={platoon}
                                    value={platoon}
                                    onSelect={() => {
                                        const newSelection = selectedPlatoons.includes(platoon)
                                            ? selectedPlatoons.filter((p) => p !== platoon)
                                            : [...selectedPlatoons, platoon];
                                        onSelectionChange(newSelection);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedPlatoons.includes(platoon) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {platoon}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
                <div className="p-2 border-t">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center"
                        onClick={() => onSelectionChange(allPlatoons)}
                    >
                        {lang === 'he' ? 'בחר הכל' : 'Select All'}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center mt-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onSelectionChange([])}
                    >
                        {lang === 'he' ? 'נקה בחירה' : 'Clear Selection'}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}