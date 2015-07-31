require 'redis'

#create a list of import files to be imported then parse the files

def gen_redis_proto(*cmd)
  
    proto = ""
    proto << "*"+cmd.length.to_s+"\r\n"
    cmd.each{|arg|
        proto << "$"+arg.to_s.bytesize.to_s+"\r\n"
        proto << arg.to_s+"\r\n"
    }
    #agency_id.gsub! ' ', '_'
    #id.gsub! ' ', '_'
       
    begin
      file = File.open("../../../cache/rds_mass_inserts_test.txt", "a+")
      file.write(proto) 
    rescue IOError => e
      #some error occur, dir not writable etc.
    ensure
      file.close unless file == nil
    end
    proto
end

#puts gen_redis_proto("SET","mykey","Hello World!").inspect

#puts *ARGV

(0...2).each{|n|
    #STDOUT.write(gen_redis_proto("SET","Key#{n}","Value#{n}"))
    gen_redis_proto("SET","Key#{n}","#{n}")
}

=begin
File.open("../../../cache/rds_mass_inserts_test.txt", "r") do |f1|  
  while line = f1.gets  
    puts line  
  end  
end 


*3
$3
SET
$4
Key0
$6
Value0
*3
$3
SET
$4
Key1
$6
Value1


 
=end


