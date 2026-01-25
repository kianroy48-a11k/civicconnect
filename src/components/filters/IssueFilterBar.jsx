import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, MapPin, Calendar, List } from 'lucide-react';

export default function IssueFilterBar({ filters, onFilterChange }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-200/50 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-emerald-700" />
        <h3 className="font-semibold text-emerald-900">Filter & Sort</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* State Filter */}
        <Select value={filters.state} onValueChange={(value) => onFilterChange({ ...filters, state: value })}>
          <SelectTrigger className="border-emerald-200 focus:ring-emerald-500">
            <SelectValue placeholder="All States" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            <SelectItem value="Maharashtra">Maharashtra</SelectItem>
            <SelectItem value="Karnataka">Karnataka</SelectItem>
            <SelectItem value="Delhi">Delhi</SelectItem>
            <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
            <SelectItem value="Gujarat">Gujarat</SelectItem>
            <SelectItem value="Rajasthan">Rajasthan</SelectItem>
            <SelectItem value="West Bengal">West Bengal</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select value={filters.category} onValueChange={(value) => onFilterChange({ ...filters, category: value })}>
          <SelectTrigger className="border-emerald-200 focus:ring-emerald-500">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Garbage">🗑️ Garbage</SelectItem>
            <SelectItem value="Water">💧 Water</SelectItem>
            <SelectItem value="Road">🛣️ Road</SelectItem>
            <SelectItem value="Safety">⚠️ Safety</SelectItem>
            <SelectItem value="Parks">🌳 Parks</SelectItem>
            <SelectItem value="Other">📋 Other</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={filters.status} onValueChange={(value) => onFilterChange({ ...filters, status: value })}>
          <SelectTrigger className="border-emerald-200 focus:ring-emerald-500">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Reported">Reported</SelectItem>
            <SelectItem value="Verified">Verified</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        {/* Time Filter */}
        <Select value={filters.time} onValueChange={(value) => onFilterChange({ ...filters, time: value })}>
          <SelectTrigger className="border-emerald-200 focus:ring-emerald-500">
            <SelectValue placeholder="All Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Filter */}
        <Select value={filters.sort} onValueChange={(value) => onFilterChange({ ...filters, sort: value })}>
          <SelectTrigger className="border-emerald-200 focus:ring-emerald-500">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest First</SelectItem>
            <SelectItem value="proximity">High Proximity Neglect</SelectItem>
            <SelectItem value="ignored">Most Ignored</SelectItem>
            <SelectItem value="active">Most Active</SelectItem>
            <SelectItem value="urgent">Most Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}