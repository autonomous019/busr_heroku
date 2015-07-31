$LOAD_PATH << '.'

require 'rubygems' #otherwise ,require 'json' will fail
require 'open-uri'
require 'json'
require 'redis'
require 'yaml'
require 'optparse'

require 'gtfs/version'
require 'gtfs/model'
require 'gtfs/agency'
require 'gtfs/calendar'
require 'gtfs/calendar_date'
require 'gtfs/route'
require 'gtfs/shape'
require 'gtfs/stop'
require 'gtfs/stop_time'
require 'gtfs/trip'
require 'gtfs/custom_exceptions'
require 'gtfs/fare_attribute'
require 'gtfs/fare_rule'
require 'gtfs/frequency'
require 'gtfs/transfer'
require 'gtfs/source'
require 'gtfs/url_source'
require 'gtfs/local_source'




class FileRunError < StandardError
   attr_reader :reason
   def initialize(reason)
      @reason = reason
   end
end





# main driver
options = {}
OptionParser.new do |opts|
  
  opts.banner = "Usage: parser.rb [options]"

  
  opts.on("-z", "--zipfile", "filename of zip archive to parse") do |z|
    #puts "agency: "+a.to_s
    options[:zipfile] = z
  end
  
  #need an option -l to list agencies ready for aggregation
  
  
end.parse!

#puts options
#puts ARGV

# usage: ruby parser.rb -z 'intercity-transit_20140107_0555.zip'
# Defaults to strict checking of required columns
#source = GTFS::Source.build("http://gtfs.s3.amazonaws.com/santa-cruz-metro_20130918_0104.zip")

# Relax the column checks, useful for sources that don't conform to standard
#source = GTFS::Source.build("http://gtfs.s3.amazonaws.com/santa-cruz-metro_20130918_0104.zip", {strict: false})



ARGV.each do |argv|
  
  source = GTFS::Source.build('files/'+argv)
 


  begin
    agencies = source.agencies #REQUIRED TO RUN, dependent on agencies 
    routes = source.routes #intercity
    stops = source.stops #intercity
    trips = source.trips #intercity  
    stop_times = source.stop_times  #intercity
    source.calendars  #intercity
    source.calendar_dates #intercity    
    source.fare_attributes   
    source.fare_rules         
    source.frequencies  
    source.transfers 
    source.shapes #intercity
  rescue FileRunError => some_variable
    raise FileRunError.new($!)
    
  else
    #source.frequencies
  ensure
    # ensure that this code always runs, no matter what
  end

  
  
end



#don't forget to run aggregator.rb after parsing and creating redis hashes.  