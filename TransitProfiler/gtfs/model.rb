require 'csv'
require 'rubygems' #otherwise ,require 'json' will fail
require 'open-uri'
require 'json'
require 'redis'



module GTFS
  module Model
    def self.included(base)
      base.extend ClassMethods

      base.class_variable_set('@@prefix', '')
      base.class_variable_set('@@optional_attrs', [])
      base.class_variable_set('@@required_attrs', [])

      def valid?
        !self.class.required_attrs.any?{|f| self.send(f.to_sym).nil?}
      end

      def initialize(attrs)
        attrs.each do |key, val|
          instance_variable_set("@#{key}", val)
          
        end
        
      end
    end

    module ClassMethods

      #####################################
      # Getters for class variables
      #####################################

      def prefix
        self.class_variable_get('@@prefix')
      end
      

      def optional_attrs
        self.class_variable_get('@@optional_attrs')
      end

      def required_attrs
        self.class_variable_get('@@required_attrs')
      end

      def attrs
       required_attrs + optional_attrs
      end

      #####################################
      # Helper methods for setting up class variables
      #####################################

      def has_required_attrs(*attrs)
        self.class_variable_set('@@required_attrs', attrs)
      end

      def has_optional_attrs(*attrs)
        self.class_variable_set('@@optional_attrs', attrs)
      end

      def column_prefix(prefix)
        self.class_variable_set('@@prefix', prefix)
      end

      def required_file(required)
        self.define_singleton_method(:required_file?) {required}
      end

      def collection_name(collection_name)
        self.define_singleton_method(:name) {collection_name}

        self.define_singleton_method(:singular_name) {
          self.to_s.split('::').last.
            gsub(/([A-Z]+)([A-Z][a-z])/,'\1_\2').
            gsub(/([a-z\d])([A-Z])/,'\1_\2').
            tr("-", "_").downcase
        }
      end

      def uses_filename(filename)
        self.define_singleton_method(:filename) {filename}
      end

      def each(filename)
        
        CSV.foreach(filename, :headers => true) do |row|
          require 'json'
          # => true
       
          yield parse_model(row.to_hash)
        end
        
      end
      
      ##### filter_list() #####################
      # 
      #
      #
      ########################################
      def filter_list(model_name)
        #get list of attributes per model
          modeler = model_name.to_s
          result = case modeler
             when 'agency_' then return "name url timezone id lang phone fare_url"
             when 'stops_' then return "id name lat lon code desc zone_id url location_type parent_station timezone wheelchair_boarding"
             when 'calendar_date_' then return "service_id date exception_type"
             when 'calendar_' then return "service_id monday tuesday wednesday thursday friday saturday sunday start_date end_date"
             when 'fare_attribute_' then return "fare_id price currency_type payment_method transfer_duration transfers"
             when 'fare_rule_' then return "fare_id route_id origin_id destination_id contains_id"
             when 'frequency_' then return "trip_id start_time end_time headway_secs exact_times"
             when 'route_' then return "id short_name long_name type agency_id desc url color text_color"
             when 'shape_' then return "id pt_lat pt_lon pt_sequence dist_traveled"
             when 'stop_time_' then return "trip_id arrival_time departure_time stop_id stop_sequence stop_headsign pickup_type drop_off_type shape_dist_traveled"
             when 'stop_' then return "id name lat lon code desc zone_id url location_type parent_station timezone wheelchair_boarding"
             when 'transfer_' then return "from_stop_id to_stop_id type min_transfer_time"
             when 'trip_' then return "route_id service_id id headsign short_name direction_id block_id shape_id wheelchair_accessible"
             
             
             else 
               return "Invalid Filter"
          end
        
      end
      
      ##### parse_model() #####################
      # 
      #
      #
      ########################################
      def parse_model(attr_hash, options={})
       
        
        
         file_text = attr_hash.to_json
         $model_data = Array.new
         unprefixed_attr_hash = {}
         $var_hash = Hash.new( self.class_variable_get('@@prefix') )
         $filter_list_arr = Array.new
         f_title_list = Array.new
         
         
         model_key_length = 20
         
         #needs functionlized, setting model_key_length per model. 
         #if($model_name.to_s === 'stop_')
        #  model_key_length = 11
        #end
         
  
         key_counter = 1
         attr_hash.each do |key, val|
           #interrogate for what prefix is used to get list of attributes for given model
             $model_name = self.class_variable_get('@@prefix')
             filter_list = self.filter_list($model_name)
             $filter_list_arr = filter_list.split(" ")
           
             #then assign values to right keys, dynamic key interrogation and dynamic value assignment
             $filter_list_arr.each do |f|
               #some models have in the txt files headings "agency_id" some have no agency_ it may be trip_id with no agency_trip_id in those cases whe don't want the full model name just the header
               if($model_name.to_s === 'stop_time_' || $model_name.to_s === 'trip_' || $model_name.to_s === 'calendar_' || $model_name.to_s === 'calendar_date_'  || $model_name.to_s === 'fare_attribute_' || $model_name.to_s === 'fare_rule_'  || $model_name.to_s === 'frequency_'  || $model_name.to_s === 'transfer_' )
                 #for cases when you just need a generic "trip_id" without a model qualifier in the gtfs text file header
                   f_title = f.to_s
                   model_name_key = "#{f}"
                   #trips have a mixed title structure with some with trip_id, trip_headsign and some generic route_id
                   if($model_name.to_s === 'trip_' && f_title === 'id')
                     model_name_key = "trip_#{f}"
                     f_title = 'trip_id';
                   end
                   if($model_name.to_s === 'trip_' && f_title === 'headsign')
                     model_name_key = "trip_#{f}"
                     f_title = 'trip_headsign'
                   end
                   
                   

                   #puts model_name_key
                   
               else
                 #for cases like "agency_id" for agency_ model where headers are like "agency_id, agency_name, etc"
                   f_title = $model_name.to_s+f.to_s
                   model_name_key = "#{$model_name}#{f}"
               end
               
               if(!f_title_list.include?(f_title))
                   f_title_list.push(f_title)
               end
               $model_name_key_arr = Array.new
               $model_name_key_arr.push(model_name_key)
                 
               if(key.to_s === model_name_key.to_s)
                     #push to an key/value pair
                     $var_hash[key.to_s] = val.to_s
                
               end
               
               
                
             end
             
             #puts key_counter
            # if (key_counter > model_key_length) then
            #   #puts "NEXTING" 
            #   next
            # end
             #puts key.to_s + ' ' + val.to_s
             
             key_counter += 1

         unprefixed_attr_hash[key.gsub(/^#{prefix}/, '')] = val
        end
        
       
        
        
        #puts "-----------"
        
        
     
        
        filled_keys_arr = $var_hash.keys
        findings = f_title_list - filled_keys_arr 
        findings.each do |x|
          $var_hash[x] = ""
        end

        redis = Redis.new(:host => "localhost", :port => 6379)
        
        #TODO: need to empty the redis hash for each row if it exists before updating it.  
        
        $var_hash.each do |key, val|
          if (key === 'agency_name'  && $model_name.to_s === 'agency_' )
            agency_name = val
            $agency_id = agency_name
            agency_name = underscore(agency_name)
            redisize("HSET","agency:#{agency_name}",$var_hash)
            redisize("SADD", "agencies", agency_name)
            #cache_writer('agencies', '', $model, $var_hash)
            
          end
          
          if (key === 'route_id'   && $model_name.to_s === 'route_')
            route_id = val
            
            #if($agency_id === 'Intercity_Transit') 
            #  route_id = $var_hash['route_short_name']
            #end
            #puts route_id
            redisize("SADD", $agency_id+"_routes", route_id)
            redisize("HSET",$agency_id+":route_"+route_id, $var_hash)
            
          end
          
          
          if (key === 'stop_id'   && $model_name.to_s === 'stop_')
            stop_id = val
            redisize("SADD", $agency_id+"_stops", stop_id) #used for sys wide map
            redisize("HSET",$agency_id+":stop_"+stop_id, $var_hash)
          end
          
          if (key === 'trip_id'   && $model_name.to_s === 'trip_')
            trip_id = val
            #puts trip_id
            trip_id = 0.to_s if trip_id.nil? || trip_id.empty?
            route_id = $var_hash['route_id']
            #puts route_id
            #trip_id,route_id,service_id,trip_headsign,block_id,shape_id           
            #redisize("SADD", $agency_id+"_trips", trip_id+" "+route_id) #trips for agency set

            redisize("SADD", $agency_id+"_trips_"+route_id, trip_id) #trips for a route set
            
            #set of stops for a route from stop_times at end of import to create master sets from master data
            redisize("HSET",$agency_id+":trip_"+trip_id, $var_hash)
          end
          
         
          if (key === 'trip_id' && $model_name.to_s === 'stop_time_')
            stop_id = $var_hash['stop_id']
            
            
            trip_id = val
            #puts stop_id
            #stop_times_<trip_id>
            
            redisize("SADD", $agency_id+"_stop_times_"+trip_id, stop_id)
            #in view get stops per trip get routes from trip
            redisize("HSET",$agency_id+":stop_times_"+trip_id+"_"+stop_id, $var_hash)
            
          end
          

          if (key === 'service_id' && $model_name.to_s === 'calendar_')
            service_id = val
            redisize("SADD", $agency_id+"_calendar", service_id)
            redisize("HSET",$agency_id+":calendar_"+service_id, $var_hash)
           
          end
          
          if (key === 'date' && $model_name.to_s === 'calendar_date_')
            date = val
            redisize("SADD", $agency_id+"_calendar_dates", date)
            redisize("HSET",$agency_id+":calendar_date_"+date, $var_hash)
          end
          
          if (key === 'fare_id' && $model_name.to_s === 'fare_attribute_')
            fare_id = val
            redisize("SADD", $agency_id+"_fare_attributes", fare_id)
            redisize("HSET",$agency_id+":fare_attribute_"+fare_id, $var_hash)
          end
          
          if (key === 'fare_id' && $model_name.to_s === 'fare_rule_')
            fare_id = val
            redisize("SADD", $agency_id+"_fare_rules", fare_id)
            redisize("HSET",$agency_id+":fare_rule_"+fare_id, $var_hash)
          end
          
          if (key === 'trip_id' && $model_name.to_s === 'frequency_')
            trip_id = val
            redisize("SADD", $agency_id+"_frequencies", trip_id)
            redisize("HSET",$agency_id+":frequency_"+trip_id, $var_hash)
          end
          
          if (key === 'from_stop_id' && $model_name.to_s === 'transfer_')
            from_stop_id = val
            redisize("SADD", $agency_id+"_transfers", from_stop_id)
            redisize("HSET",$agency_id+":transfer_"+from_stop_id, $var_hash)
          end
          
          if (key === 'shape_id'  && $model_name.to_s === 'shape_')
            $shape_id = val
          end
          
          if (key === 'shape_pt_sequence'  && $model_name.to_s === 'shape_')
            shape_pt_sequence = val
            
            redisize("HSET",$agency_id+":shapes_"+$shape_id.to_s+"_"+shape_pt_sequence.to_s, $var_hash) #Intercity_Transit:shapes_8_17
            redisize("SADD",$agency_id+"_shape_"+$shape_id.to_s, shape_pt_sequence.to_s) #Intercity_Transit_shape_8 a set of shape_pt_sequences to shape_id
            
          end
           
       end
      
       
       
        model = self.new(unprefixed_attr_hash)
        
      end #end filter method
      
      
      
     
      ##### redis_hasher() #####################
      # r_hasher = redis_hasher($var_hash)
      #
      #
      ########################################
      def hasher(rhash) 
        
        
               
        counter = 1
        
        r_str = "{ \n"
        rhash.each do |key,val|
          #val.gsub! ' ', '_'
          #val.gsub! '\\', '-'
          #val.gsub! '(', ''
          #val.gsub! ')', ''
          #val.gsub! 'http://', ''
          #val.gsub! '/', ''
        if (counter < rhash.length)  
          my_setter = "'"+key+"': , '"+val+"', \n "
        else
          my_setter = "'"+key+"'"" , '"+val+"' \n"
          my_setter += "\n }, \n"
        end
        
          r_str += my_setter
          counter += 1
            
        end
       
        return  r_str
      end

      
      ##### redisize() #####################
      # redisize("HMSET","#{agency_name}","#{r_hasher}")
      #
      #
      ########################################
      def redisize(mode, name, data)
        redis = Redis.new(:host => "localhost", :port => 6379)  
  
          if( mode === "HSET" )
            #HSET 
            data.each do |key,val|
              #redis.hset(name, key, val)
              gen_redis_proto("HSET",name,key, val).inspect
              #puts gen_redis_proto("SET","mykey","Hello World!").inspect
            end
 
          end
          
          if( mode === "SADD" )
            #HSET 
          
              #redis.sadd(name, data)
              gen_redis_proto("SADD",name,data).inspect
          end
          
          
          
           #puts "redis.hmset("+name.to_s+", "+data.to_s+")"
      end
      

      ##### file_emptier() #####################
      # 
      #
      #
      ########################################
      def file_emptier(agency_id)        
        agency_id.gsub! ' ', '_'
        
        if (File.exist?("../../../cache/"+agency_id+".txt"))
             empty = File.open("../../../cache/"+agency_id+".txt", "w") {|file| file.truncate(0) }
        end
        
        
      end
      
      
      ##### underscore() #####################
      # 
      #
      #
      ########################################
      def underscore(name)        
        name.gsub! ' ', '_'
        return name
        
      
        
      end
      
      ##### rdb_writer() #####################
      # 
      #
      #
      ########################################
      def rdb_writer(agency_id, id, model, file_text)
        #id here should be some unique id per item row in a given model struct
        
        agency_id.gsub! ' ', '_'
        id.gsub! ' ', '_'
           
        begin
          file = File.open("../../../cache/"+agency_id+".txt", "a+")
          file.write(file_text) 
        rescue IOError => e
          #some error occur, dir not writable etc.
        ensure
          file.close unless file == nil
        end
        
        
      end

      ##### gen_redis_proto() #####################
      #
      #  592  redis-cli FLUSHDB
      #  
      #  598  cat ../../../cache/rds_mass_inserts_test.txt | redis-cli --pipe
      #  599  redis-cli KEYS '*'
      #"*3\r\n$3\r\nSET\r\n$3\r\nkey\r\n$5\r\nvalue\r\n"
      #
      ########################################
      def gen_redis_proto(*cmd)
              #HMSET agency:Redwood_Transit_System  agency_id  "1"   agency_name  "Redwood Transit System"   agency_url  "http://www.redwoodtransit.org/" agency_timezone  "America/Los_Angeles"   agency_phone  "(707) 443-0826" agency_fare_url  ""   agency_lang  "en" 
          proto = ""
          proto << "*"+cmd.length.to_s+"\r\n"
          cmd.each{|arg|
              proto << "$"+arg.to_s.bytesize.to_s+"\r\n"
              proto << arg.to_s+"\r\n"
          }

          puts proto
      end
      
      
      ##### cache_writer() #####################
      # 
      #
      #
      ########################################
      def cache_writer(agency_id, id, model, file_text)
        #id here should be some unique id per item row in a given model struct
        file_text = hasher(file_text)
        agency_id.gsub! ' ', '_'
        id.gsub! ' ', '_'
        model = model.to_s
        id = id.to_s
        #r_str = "var agencies = [{ \n"
        if (File.exist?("../../../cache/"+agency_id+"_"+model+""+id+".js"))
             empty = File.open("../../../cache/"+agency_id+"_"+model+""+id+".js", "w") {|file| file.truncate(0) }
        end
           
        begin
          file = File.open("../../../cache/"+agency_id+"_"+model+""+id+".js", "a+")
          file.write(file_text) 
        rescue IOError => e
          #some error occur, dir not writable etc.
        ensure
          file.close unless file == nil
        end
        
        
      end


      ##### parse_models() #####################
      # 
      #
      #
      ########################################
      def parse_models(data, options={})
        return [] if data.nil? || data.empty?

        models = []
        CSV.parse(data, :headers => true) do |row|
          model = parse_model(row.to_hash, options)
          models << model if options[:strict] == false || model.valid?
        end
        models
      end
    end
  end
end
