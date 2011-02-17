require 'fileutils' # ruby 1.9

task :default do
  
  merged_file = []
  ['src/server', 'src/views/index.erb'].each do |f| 
    File.open(f, "r") { |file| merged_file.push file.read }
  end
  
  merged_file = merged_file.join("\n\n__END__\n\n")
  merged_file.gsub! /#\s*enable\s*:inline_templates/, 'enable :inline_templates'

  File.open('dist/server', "w") {|f| f.write(merged_file) }
  FileUtils.copy('src/logger.js', 'dist/')

  puts "Done Building"
end