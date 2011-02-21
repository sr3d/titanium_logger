require 'fileutils' # ruby 1.9

task :default do
  
  merged_file = []
  ['src/server', 'src/views/index.erb'].each do |f| 
    File.open(f, "r") { |file| merged_file.push file.read }
  end
  
  separator = <<-SEPARATOR

__END__

@@ layout
<%= yield %>

@@ index
  
SEPARATOR
  
  merged_file = merged_file.join(separator)

  merged_file.gsub! /#\s*enable\s*:inline_templates/, 'enable :inline_templates'
  merged_file.gsub! /set\s*:public/, '#set :public'

  File.open('dist/server', "w") {|f| f.write(merged_file) }
  FileUtils.copy('src/logger.js', 'dist/')
  `chmod +x dist/server`

  puts "Done Building"
end