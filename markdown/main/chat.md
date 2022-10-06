
[//]: # (pageid: chat)
[//]: # (title: Group Chats)
[//]: # (author: @3xStan)
[//]: # (description: Learn more about the IlliniFurs group chat, including who to contact for access.)
[//]: # (focus_image: https://illinifurs.com/images/namedLogo.png)
[//]: # (widgets: true)
[//]: # (tail_scripts: ["/js/illinifurs-collapsible.js"])

# Telegram

The primary group chat of the IlliniFurs is on Telegram. Meetings and special events are also announced in this chat. Contact one of the officers below to be added.

<% officers.forEach(function(officer){ %>
    <div class="card">
        <a href="https://t.me/<%= officer['username'] %>" style="text-decoration: none;">
            <div class="container">
                <img src="<%= officer['imageURL'] %>" style="max-width: 64px;" alt="<%= officer['displayName'] %>'s profile pic" />
                <br />
                <%= officer['title'] %>: <%= officer['displayName'] %>
            </div>
        </a>
    </div>
<% }) %>

# Discord

There is an IlliniFurs Discord server, which is mostly used for voice chat.
