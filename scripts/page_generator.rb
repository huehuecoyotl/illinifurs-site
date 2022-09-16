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
      line.match(/\[\/\/\]\: \# \(([^\:]*)\: ([^\)]*)\)/) do |m|
        key = m.captures[0]
        value = m.captures[1]

        is_string = not(value[0].eql? '[' or value[0].eql? '{')
        value_head = '{"value": ' + (is_string ? '"' : '')
        value_tail = (is_string ? '"' : '') + '}'
        
        curr_page[key] = JSON.parse(value_head + value + value_tail)["value"]
      end
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
