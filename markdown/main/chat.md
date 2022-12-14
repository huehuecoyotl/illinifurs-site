
[//]: # (pageid: chat)
[//]: # (title: Group Chats)
[//]: # (author: @3xStan)
[//]: # (description: Learn more about the IlliniFurs group chat, including who to contact for access.)
[//]: # (focus_image: https://illinifurs.com/images/namedLogo.png)
[//]: # (widgets: true)
[//]: # (tail_scripts: ["/js/illinifurs-collapsible.js"])

# Telegram

The primary group chat of the IlliniFurs is on Telegram. Meetings and special events are announced in this chat, and it's where most conversation happens as well. Contact one of the officers below to be added.

<% officers.forEach(function(officer){ %>
    <div class="card">
        <a href="https://t.me/<%= officer['username'] %>" style="text-decoration: none;">
            <div class="container">
                <img class="officer-pic" src="<%= officer['imageURL'] %>" alt="<%= officer['displayName'] %>'s profile pic" />
                <br />
                <%= officer['title'] %>: <%= officer['displayName'] %>
            </div>
        </a>
    </div>
<% }) %>

# Discord

There is also an IlliniFurs Discord server. It's not very active -- it's mostly used for voice chat, particularly in between semesters -- but you can [check it out here](https://discord.gg/w5Uar5FscD).
