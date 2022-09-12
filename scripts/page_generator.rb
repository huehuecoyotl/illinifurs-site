#!/usr/bin/ruby

##
# page_generator.rb - Processes markdown files into files that EJS can render
# created by Stan
#
# USAGE: "ruby page_generator.rb"

require 'fileutils'
require 'json'

all_pages = Array.new

Dir.foreach("./markdown/") do |dirname|
  next if dirname.start_with? "."
  next if dirname.eql? "Makefile"
  Dir.foreach("./markdown/#{dirname}/") do |filename|
    next if filename.start_with? "."
    next unless filename.end_with? ".md"
    flag_used = false
    curr_page = Hash.new { |hash, key| hash[key] = "" }

    File.open("./markdown/#{dirname}/#{filename}").each do |line|
      next unless line.start_with? '[//]: #'
      flag_used = true if line.start_with? '[//]: #'
      line.match(/\[\/\/\]\: \# \(([^\:]*)\: ([^\)]*)\)/) { |m| curr_page[m.captures[0]] = m.captures[1] }
    end

    if flag_used
      curr_page["directory"] = dirname
      all_pages << curr_page
    end
  end
end

system("cd ./markdown; make all; cd -")

FileUtils.mkdir_p './misc'
File.open("./misc/pages.json","w") do |f|
  f.write(JSON.pretty_generate(all_pages))
end
