import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { format } from 'date-fns';

export default function DocumentFilters({ platoons, onFilterChange, currentFilters }) {
    const handleChange = (newValues) => {
        onFilterChange({ ...currentFilters, ...newValues });
    };

    return (
        <div className="flex flex-col md:flex-row flex-wrap gap-4 p-4 bg-white border rounded-lg mb-6 shadow-sm">
            {/* Search Filter */}
            <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium text-slate-700 mb-1 block">Search Soldier</label>
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Filter by soldier name or ID..."
                        value={currentFilters.searchTerm || ''}
                        onChange={(e) => handleChange({ searchTerm: e.target.value })}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Platoon Filter */}
            <div className="flex-1 min-w-[150px]">
                <label className="text-sm font-medium text-slate-700 mb-1 block">Platoon</label>
                <Select value={currentFilters.platoon || 'all'} onValueChange={(value) => handleChange({ platoon: value })}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by platoon" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Platoons</SelectItem>
                        {platoons.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            
            {/* Status Filter */}
            <div className="flex-1 min-w-[150px]">
                <label className="text-sm font-medium text-slate-700 mb-1 block">Status</label>
                <Select value={currentFilters.status || 'all'} onValueChange={(value) => handleChange({ status: value })}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Not Cleared</SelectItem>
                        <SelectItem value="returned">Cleared</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Date Filter */}
            <div className="flex-1 min-w-[280px]">
                <label className="text-sm font-medium text-slate-700 mb-1 block">Assignment Date Range</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {currentFilters.date?.from ? (
                                currentFilters.date.to ? (
                                    <>{format(currentFilters.date.from, "LLL dd, y")} - {format(currentFilters.date.to, "LLL dd, y")}</>
                                ) : (
                                    format(currentFilters.date.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date range</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={currentFilters.date?.from}
                            selected={currentFilters.date}
                            onSelect={(newDate) => handleChange({ date: newDate })}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}