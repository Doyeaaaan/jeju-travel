"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Search,
  User,
  X,
  ArrowLeftRight,
  Clock,
  Plane,
  CalendarIcon,
  Info,
  Star,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FlightsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<number | null>(null);
  const [tripType, setTripType] = useState("roundtrip");
  const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 });
  const [showPassengerSelector, setShowPassengerSelector] = useState(false);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const toggleFlightDetails = (index: number) => {
    setSelectedFlight(selectedFlight === index ? null : index);
  };

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  return (
    <div className="bg-white min-h-screen">
      {/* Header with breadcrumbs */}
      <div className="bg-gray-100 py-4 border-b border-gray-200">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center text-sm text-gray-600">
            <a href="/" className="hover:text-blue-600">Home</a>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="font-medium text-gray-900">Flight Search</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 py-6">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Your Flight</h1>
          <p className="text-gray-600 mt-2">Search and compare flights to find the best deals</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8 p-6 shadow-md">
          <Tabs defaultValue="roundtrip" className="mb-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger 
                value="roundtrip" 
                onClick={() => setTripType("roundtrip")}
              >
                Round Trip
              </TabsTrigger>
              <TabsTrigger 
                value="oneway" 
                onClick={() => setTripType("oneway")}
              >
                One Way
              </TabsTrigger>
              <TabsTrigger 
                value="multicity" 
                onClick={() => setTripType("multicity")}
              >
                Multi-City
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
            <div className="lg:col-span-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input 
                    className="pl-10 h-12" 
                    placeholder="Departure City or Airport" 
                    defaultValue="Seoul (ICN)"
                  />
                </div>
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input 
                    className="pl-10 h-12" 
                    placeholder="Arrival City or Airport" 
                    defaultValue="Jeju (CJU)"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute -left-6 top-1/2 transform -translate-y-1/2 rounded-full bg-white shadow-md border border-gray-200 z-10 hidden lg:flex"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departure</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input 
                    className="pl-10 h-12" 
                    type="date" 
                    defaultValue="2023-07-15"
                  />
                </div>
              </div>
              
              {tripType === "roundtrip" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Return</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input 
                      className="pl-10 h-12" 
                      type="date" 
                      defaultValue="2023-07-22"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
              <Popover open={showPassengerSelector} onOpenChange={setShowPassengerSelector}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full h-12 justify-between font-normal"
                  >
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>{totalPassengers} {totalPassengers === 1 ? 'Passenger' : 'Passengers'}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium">Passengers</h4>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Adults</p>
                        <p className="text-sm text-gray-500">Age 12+</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => setPassengers({...passengers, adults: Math.max(1, passengers.adults - 1)})}
                        >
                          <span>-</span>
                        </Button>
                        <span className="w-8 text-center">{passengers.adults}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => setPassengers({...passengers, adults: Math.min(9, passengers.adults + 1)})}
                        >
                          <span>+</span>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Children</p>
                        <p className="text-sm text-gray-500">Age 2-11</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => setPassengers({...passengers, children: Math.max(0, passengers.children - 1)})}
                        >
                          <span>-</span>
                        </Button>
                        <span className="w-8 text-center">{passengers.children}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => setPassengers({...passengers, children: Math.min(9, passengers.children + 1)})}
                        >
                          <span>+</span>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Infants</p>
                        <p className="text-sm text-gray-500">Under 2</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => setPassengers({...passengers, infants: Math.max(0, passengers.infants - 1)})}
                        >
                          <span>-</span>
                        </Button>
                        <span className="w-8 text-center">{passengers.infants}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => setPassengers({...passengers, infants: Math.min(passengers.adults, passengers.infants + 1)})}
                        >
                          <span>+</span>
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={() => setShowPassengerSelector(false)}
                    >
                      Apply
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Select defaultValue="economy">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Cabin Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="premium">Premium Economy</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="first">First Class</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="direct" />
                <label htmlFor="direct" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Direct flights only
                </label>
              </div>
            </div>
            
            <Button className="w-full sm:w-auto px-8" size="lg">
              <Search className="mr-2 h-4 w-4" />
              Search Flights
            </Button>
          </div>
        </Card>

        {/* Main Content Area with Filters and Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Card className="p-5 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                    Reset All
                  </Button>
                </div>
                
                <Accordion type="multiple" defaultValue={["price", "times", "airlines", "stops"]}>
                  <AccordionItem value="price">
                    <AccordionTrigger className="py-3">Price Range</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm">₩100,000</span>
                          <span className="text-sm">₩500,000</span>
                        </div>
                        <Slider defaultValue={[150000, 350000]} min={100000} max={500000} step={10000} />
                        <div className="flex justify-between">
                          <div className="border rounded p-2 text-sm w-24 text-center">
                            ₩150,000
                          </div>
                          <div className="border rounded p-2 text-sm w-24 text-center">
                            ₩350,000
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="times">
                    <AccordionTrigger className="py-3">Departure Times</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="morning" />
                          <label htmlFor="morning" className="text-sm">Morning (5:00 - 11:59)</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="afternoon" />
                          <label htmlFor="afternoon" className="text-sm">Afternoon (12:00 - 17:59)</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="evening" />
                          <label htmlFor="evening" className="text-sm">Evening (18:00 - 22:59)</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="night" />
                          <label htmlFor="night" className="text-sm">Night (23:00 - 4:59)</label>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="airlines">
                    <AccordionTrigger className="py-3">Airlines</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="korean" />
                          <label htmlFor="korean" className="text-sm">Korean Air</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="asiana" />
                          <label htmlFor="asiana" className="text-sm">Asiana Airlines</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="jeju" />
                          <label htmlFor="jeju" className="text-sm">Jeju Air</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="tway" />
                          <label htmlFor="tway" className="text-sm">T'way Air</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="jin" />
                          <label htmlFor="jin" className="text-sm">Jin Air</label>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="stops">
                    <AccordionTrigger className="py-3">Stops</AccordionTrigger>
                    <AccordionContent>
                      <RadioGroup defaultValue="any">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="any" id="any" />
                          <label htmlFor="any" className="text-sm">Any</label>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <RadioGroupItem value="nonstop" id="nonstop" />
                          <label htmlFor="nonstop" className="text-sm">Nonstop only</label>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <RadioGroupItem value="1stop" id="1stop" />
                          <label htmlFor="1stop" className="text-sm">1 stop max</label>
                        </div>
                      </RadioGroup>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="duration">
                    <AccordionTrigger className="py-3">Duration</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm">1h</span>
                          <span className="text-sm">5h+</span>
                        </div>
                        <Slider defaultValue={[180]} min={60} max={300} step={10} />
                        <div className="text-sm">
                          Max duration: 3h 0m
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-3">
            {/* Sort and View Options */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <div className="flex items-center">
                <span className="font-medium mr-2">Sort by:</span>
                <Select defaultValue="recommended">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="departure">Departure Time</SelectItem>
                    <SelectItem value="arrival">Arrival Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Fastest</span>
                  <X className="h-3 w-3 ml-1 cursor-pointer" />
                </Badge>
                <Badge variant="outline" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
                  <span>Morning Departure</span>
                  <X className="h-3 w-3 ml-1 cursor-pointer" />
                </Badge>
              </div>
            </div>
            
            {/* Price Alert */}
            <Card className="mb-6 p-4 border-blue-200 bg-blue-50">
              <div className="flex items-center">
                <Info className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-blue-800">Price Alert</p>
                  <p className="text-sm text-blue-700">Prices for this route typically range from ₩120,000 to ₩350,000. Current prices are within the average range.</p>
                </div>
                <Button variant="link" className="ml-auto text-blue-700">
                  Set Alert
                </Button>
              </div>
            </Card>
            
            {/* Flight Results */}
            <div className="space-y-6">
              {[...Array(5)].map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="border-b border-gray-200">
                    <div className="p-5">
                      <div className="grid grid-cols-12 gap-4">
                        {/* Airline Logo & Info */}
                        <div className="col-span-2 flex flex-col items-center justify-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                            <Plane className="h-6 w-6 text-blue-600" />
                          </div>
                          <p className="text-sm font-medium text-center">Korean Air</p>
                          <p className="text-xs text-gray-500">KE 1234</p>
                        </div>
                        
                        {/* Flight Times & Duration */}
                        <div className="col-span-7 flex items-center">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <p className="text-xl font-bold">07:30</p>
                                <p className="text-sm text-gray-500">ICN</p>
                              </div>
                              
                              <div className="flex-1 mx-4 relative">
                                <div className="border-t border-gray-300 absolute w-full top-1/2"></div>
                                <div className="absolute w-full text-xs text-gray-500 text-center -mt-3">
                                  1h 10m
                                </div>
                                <div className="absolute right-0 w-2 h-2 rounded-full bg-gray-400 top-1/2 transform -translate-y-1/2"></div>
                                <div className="absolute left-0 w-2 h-2 rounded-full bg-gray-400 top-1/2 transform -translate-y-1/2"></div>
                              </div>
                              
                              <div className="text-right">
                                <p className="text-xl font-bold">08:40</p>
                                <p className="text-sm text-gray-500">CJU</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600">
                              <Badge variant="outline" className="mr-2 bg-green-50 text-green-700 border-green-200">
                                Nonstop
                              </Badge>
                              <span>Economy • Boeing 737 • WiFi Available</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Price & Book */}
                        <div className="col-span-3 flex flex-col items-end justify-center">
                          <div className="text-right mb-2">
                            <p className="text-2xl font-bold text-blue-600">₩145,000</p>
                            <p className="text-sm text-gray-500">per person</p>
                          </div>
                          <Button className="w-full">Select Flight</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expandable Details */}
                  <div className="px-5 py-3 bg-gray-50 flex justify-between items-center cursor-pointer" onClick={() => toggleFlightDetails(index)}>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-700">Flight Details</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm">4.5 (230 reviews)</span>
                      </div>
                    </div>
                    {selectedFlight === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  
                  {selectedFlight === index && (
                    <div className="p-5 border-t border-gray-200">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                          <h4 className="font-medium mb-4">Flight Details</h4>
                          
                          <div className="space-y-6">
                            <div className="flex">
                              <div className="mr-4">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Plane className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="h-full w-0.5 bg-gray-200 mx-auto my-1"></div>
                              </div>
                              
                              <div>
                                <p className="font-medium">Departure • July 15, 2023</p>
                                <div className="mt-2 space-y-2">
                                  <div className="flex">
                                    <p className="w-16 text-gray-500 text-sm">07:30</p>
                                    <div>
                                      <p className="font-medium">Incheon International Airport (ICN)</p>
                                      <p className="text-sm text-gray-600">Terminal 2</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <p className="w-16 text-gray-500 text-sm"></p>
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Clock className="h-4 w-4 mr-1" />
                                      <span>1h 10m • Nonstop</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex">
                                    <p className="w-16 text-gray-500 text-sm">08:40</p>
                                    <div>
                                      <p className="font-medium">Jeju International Airport (CJU)</p>
                                      <p className="text-sm text-gray-600">Main Terminal</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="border-t border-gray-200 pt-4">
                              <h5 className="font-medium mb-2">Amenities</h5>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center">
                                  <Checkbox id="wifi" checked={true} />
                                  <label htmlFor="wifi" className="ml-2">WiFi Available</label>
                                </div>
                                <div className="flex items-center">
                                  <Checkbox id="power" checked={true} />
                                  <label htmlFor="power" className="ml-2">Power Outlets</label>
                                </div>
                                <div className="flex items-center">
                                  <Checkbox id="entertainment" checked={true} />
                                  <label htmlFor="entertainment" className="ml-2">Entertainment</label>
                                </div>
                                <div className="flex items-center">
                                  <Checkbox id="meal" checked={false} />
                                  <label htmlFor="meal" className="ml-2">Meal Service</label>
                                </div>
                              </div>
                            </div>
                            
                            <div className="border-t border-gray-200 pt-4">
                              <h5 className="font-medium mb-2">Baggage Information</h5>
                              <div className="space-y-2 text-sm">
                                <p><span className="font-medium">Carry-on:</span> 1 bag (10kg) included</p>
                                <p><span className="font-medium">Checked:</span> 1 bag (23kg) included</p>
                                <Button variant="link" className="p-0 h-auto text-blue-600">View baggage policy</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="lg:col-span-1">
                          <h4 className="font-medium mb-4">Price Options</h4>
                          
                          <div className="space-y-4">
                            <Card className="p-4 border-2 border-blue-200">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium">Korean Air</p>
                                  <p className="text-sm text-gray-600">Direct</p>
                                </div>
                                <p className="text-lg font-bold text-blue-600">₩145,000</p>
                              </div>
                              <Button className="w-full">Select</Button>
                            </Card>
                            
                            <Card className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                \
\
\
\
\
\
\
\
